import { RefObject } from 'react';

export interface Point {
	x: number;
	y: number;
}
export interface SegmentationResult {
	ulcer: Point[];
	coin: Point[];
}

// Change the function signature to accept a seed point
export const useAutoSegment = (canvasRef: RefObject<HTMLCanvasElement>) => {
	const segmentImage = async (seedPoint?: Point): Promise<SegmentationResult> => {
		await new Promise(resolve => setTimeout(resolve, 800));
		const canvas = canvasRef.current;
		if (!canvas) return { ulcer: [], coin: [] };

		// Use the seed point (where the user clicked) or fallback to center
		const centerX = seedPoint?.x ?? canvas.width / 2;
		const centerY = seedPoint?.y ?? canvas.height / 2;
		const radius = 50;
		const pointsCount = 16;
		const mockedUlcer: Point[] = [];

		// Generate a hardcoded circle of points in the center of the screen
		for (let i = 0; i < pointsCount; i++) {
			const angle = (i / pointsCount) * Math.PI * 2;
			mockedUlcer.push({
				x: Math.round(centerX + radius * Math.cos(angle)),
				y: Math.round(centerY + radius * Math.sin(angle)),
			});
		}

		return {
			ulcer: mockedUlcer,
			coin: [], // Leave coin empty for now
		};
	};

	return { segmentImage };
};
