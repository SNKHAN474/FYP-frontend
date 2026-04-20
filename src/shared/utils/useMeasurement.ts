import { useState } from 'react';

export type Point = { x: number; y: number };

/**
 * Standard Ray-casting algorithm for Point-in-Polygon
 */
function pointInPolygon(x: number, y: number, points: Point[]) {
	let inside = false;
	for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
		const xi = points[i].x,
			yi = points[i].y;
		const xj = points[j].x,
			yj = points[j].y;
		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}

export function useMeasurement(width: number, height: number, depthData: Uint16Array | null) {
	const [points, setPoints] = useState<Point[]>([]);
	const [result, setResult] = useState<any>(null);

	// Realistic constant: MM_PER_PIXEL.
	// 0.44mm is standard for Intel RealSense at ~30cm distance
	const MM_PER_PIXEL = 0.44;
	const AREA_PER_PIXEL = MM_PER_PIXEL * MM_PER_PIXEL;

	const reset = () => {
		setPoints([]);
		setResult(null);
	};

	/**
	 * Accuracy fix: Median Filter (3x3)
	 * Reduces noise spikes that can cause "fake" depth readings
	 */
	const getSmoothedDepth = (x: number, y: number): number => {
		if (!depthData) return 0;
		const values: number[] = [];

		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				const nx = x + dx;
				const ny = y + dy;
				if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
					const val = depthData[ny * width + nx];
					if (val > 0) values.push(val);
				}
			}
		}

		if (values.length === 0) return 0;
		values.sort((a, b) => a - b);
		return values[Math.floor(values.length / 2)];
	};

	const calculate = () => {
		// Basic validation: must have data and a polygon (3+ points)
		if (!depthData || points.length < 3) {
			alert('Please plot at least 3 points around the wound.');
			return null;
		}

		let pixelCount = 0;
		let gapCount = 0;
		let minDepth = Infinity;
		let maxDepth = 0;
		let totalDepthSum = 0;

		const minX = Math.min(...points.map(p => p.x));
		const maxX = Math.max(...points.map(p => p.x));
		const minY = Math.min(...points.map(p => p.y));
		const maxY = Math.max(...points.map(p => p.y));

		// Scan the bounding box of the plotted polygon
		for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
			for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
				if (!pointInPolygon(x, y, points)) continue;

				// Use smoothed depth instead of raw pixel for accuracy
				const rawDepth = getSmoothedDepth(x, y);

				// 1. GAP DETECTION
				if (!rawDepth || rawDepth === 0) {
					gapCount++;
					continue;
				}

				const depthMM = rawDepth * 0.1; // Typical RealSense scale is 0.1mm per unit

				pixelCount++;
				totalDepthSum += depthMM;

				if (depthMM < minDepth) minDepth = depthMM;
				if (depthMM > maxDepth) maxDepth = depthMM;
			}
		}

		const totalSamples = pixelCount + gapCount;

		// --- FRIDAY FOCUS: REJECTION LOGIC ---

		// A. Reject if no valid pixels found
		if (pixelCount === 0 || totalSamples === 0) {
			alert('Measurement rejected: No depth data found within selection.');
			return null;
		}

		// B. Reject if too many gaps (> 30% of area is missing data)
		const gapRatio = gapCount / totalSamples;
		if (gapRatio > 0.3) {
			alert(
				`Measurement rejected: Data quality too low. Gap ratio: ${(gapRatio * 100).toFixed(1)}%. Please re-scan.`,
			);
			return null;
		}

		const avgDepth = totalDepthSum / pixelCount;
		const realAreaMM2 = pixelCount * AREA_PER_PIXEL;
		const ulcerHoleDepth = maxDepth - minDepth;

		// C. Reject if Depth = 0 (Ulcer is flat or surface noise)
		// 0.5mm threshold accounts for standard sensor jitter
		if (ulcerHoleDepth < 0.5) {
			alert('Measurement rejected: Wound depth detected as zero or flat surface.');
			return null;
		}

		const res = {
			area: realAreaMM2,
			avgDepth: avgDepth,
			maxDepth: maxDepth,
			minDepth: minDepth,
			ulcerDepth: ulcerHoleDepth,
			pixelCount: pixelCount,
			gapRatio: gapRatio,
			confidence: (1 - gapRatio) * 100,
		};

		setResult(res);
		return res;
	};

	return {
		points,
		setPoints,
		// Simplified addPoint to be used in Canvas click events
		addPoint: (x: number, y: number) => setPoints(prev => [...prev, { x, y }]),
		reset,
		calculate,
		result,
		setResult,
	};
}
