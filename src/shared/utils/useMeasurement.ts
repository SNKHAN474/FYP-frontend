import { useState, useMemo } from 'react';

export type Point = { x: number; y: number };

interface MeasurementOptions {
	coinPoints?: Point[]; // The reference polygon (£1 coin)
	depthScaleMM?: number; // Usually 0.1 for RealSense
}

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

/**
 * Counts how many pixels are inside a given polygon
 */
function getPolygonPixelCount(points: Point[]): number {
	if (points.length < 3) return 0;
	const minX = Math.min(...points.map(p => p.x));
	const maxX = Math.max(...points.map(p => p.x));
	const minY = Math.min(...points.map(p => p.y));
	const maxY = Math.max(...points.map(p => p.y));

	let count = 0;
	for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
		for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
			if (pointInPolygon(x, y, points)) count++;
		}
	}
	return count;
}

export function useMeasurement(
	width: number,
	height: number,
	depthData: Uint16Array | null,
	options: MeasurementOptions = {},
) {
	const [points, setPoints] = useState<Point[]>([]);
	const [result, setResult] = useState<any>(null);

	const { coinPoints = [], depthScaleMM = 0.1 } = options;

	const reset = () => {
		setPoints([]);
		setResult(null);
	};

	/**
	 * Median Filter (3x3) to remove depth noise
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
		if (!depthData || points.length < 3) {
			alert('Missing depth data or ulcer points.');
			return null;
		}

		// --- STEP 1: CALCULATE REAL-WORLD SCALE ---
		let mmPerPixel = 0.293; // Default fallback for ~50cm distance
		const REAL_COIN_AREA_MM2 = 412.45; // £1 coin standard

		if (coinPoints.length >= 3) {
			const coinPixelCount = getPolygonPixelCount(coinPoints);
			if (coinPixelCount > 0) {
				// Area = pixels * (mmPerPixel^2)
				// mmPerPixel = sqrt(RealArea / PixelArea)
				mmPerPixel = Math.sqrt(REAL_COIN_AREA_MM2 / coinPixelCount);
			}
		}

		const AREA_PER_PIXEL = mmPerPixel * mmPerPixel;

		// --- STEP 2: ANALYZE TARGET ULCER ---
		const minX = Math.min(...points.map(p => p.x));
		const maxX = Math.max(...points.map(p => p.x));
		const minY = Math.min(...points.map(p => p.y));
		const maxY = Math.max(...points.map(p => p.y));

		let pixelCount = 0;
		let totalDepthSum = 0;
		let minDepth = Infinity;
		let maxDepth = -Infinity;
		let gapCount = 0;

		for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
			for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
				if (!pointInPolygon(x, y, points)) continue;

				const rawDepth = getSmoothedDepth(x, y);
				if (!rawDepth || rawDepth === 0) {
					gapCount++;
					continue;
				}

				const depthMM = rawDepth * depthScaleMM;
				pixelCount++;
				totalDepthSum += depthMM;

				if (depthMM < minDepth) minDepth = depthMM;
				if (depthMM > maxDepth) maxDepth = depthMM;
			}
		}

		const totalAreaAttempted = pixelCount + gapCount;
		if (pixelCount === 0) {
			alert('No valid depth data inside your selection.');
			return null;
		}

		// --- STEP 3: RESULTS ---
		const avgDepth = totalDepthSum / pixelCount;
		const realAreaMM2 = pixelCount * AREA_PER_PIXEL;
		const ulcerDepth = maxDepth - minDepth;

		const res = {
			area: realAreaMM2,
			avgDepth: avgDepth,
			ulcerDepth: ulcerDepth > 0 ? ulcerDepth : 0,
			mmPerPixel: mmPerPixel,
			pixelCount: pixelCount,
			gapRatio: gapCount / totalAreaAttempted,
		};

		setResult(res);
		return res;
	};

	return {
		points,
		setPoints,
		addPoint: (x: number, y: number) => setPoints(prev => [...prev, { x, y }]),
		reset,
		calculate,
		result,
		setResult,
	};
}
