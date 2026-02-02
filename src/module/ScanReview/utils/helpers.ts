import {
	DEPTH_UNITS,
	TANGENT_X_RADIANS_PER_PIXEL,
	TANGENT_Y_RADIANS_PER_PIXEL,
	CANVAS_DIMENSIONS,
	AREA_BG_COLOR_RGB,
} from './constants';
import type { Point } from './types';

const [RED, GREEN, BLUE] = AREA_BG_COLOR_RGB;
const { X: X_CANVAS } = CANVAS_DIMENSIONS;

const getAreaAtDepth = (depth: number) => {
	const width = depth * DEPTH_UNITS * TANGENT_X_RADIANS_PER_PIXEL;
	const height = depth * DEPTH_UNITS * TANGENT_Y_RADIANS_PER_PIXEL;
	return width * height;
};

export const findMinMaxOfPoints = (points: Point[]) => {
	let minX = points[0].x;
	let minY = points[0].y;
	let maxX = points[0].x;
	let maxY = points[0].y;

	for (let i = 1; i < points.length; i++) {
		if (points[i].x < minX) minX = points[i].x;
		if (points[i].y < minY) minY = points[i].y;
		if (points[i].x > maxX) maxX = points[i].x;
		if (points[i].y > maxY) maxY = points[i].y;
	}

	return { minX, minY, maxX, maxY };
};

export const calculateAverageDepth = (
	imagePixels: ImageData,
	minX: number,
	minY: number,
	byteArray: Uint8Array,
) => {
	let depthValueCount = 0;
	let totalDepth = 0;

	for (let yPos = 0; yPos < imagePixels.height; yPos++) {
		for (let xPos = 0; xPos < imagePixels.width; xPos++) {
			const dataPos = (yPos * imagePixels.width + xPos) * 4;
			const pixelRed = imagePixels.data[dataPos];
			const pixelGreen = imagePixels.data[dataPos + 1];
			const pixelBlue = imagePixels.data[dataPos + 2];

			if (pixelRed !== RED || pixelGreen !== GREEN || pixelBlue !== BLUE) continue;

			const depthPosition = ((minY + yPos) * X_CANVAS + (minX + xPos)) * 2;
			const depth = byteArray[depthPosition] + byteArray[depthPosition + 1] * 256;

			if (depth <= 0) continue;

			totalDepth += depth;
			depthValueCount++;
		}
	}

	const averageDepth = depthValueCount > 0 ? Math.ceil(totalDepth / depthValueCount) : 0;
	return parseFloat((averageDepth * DEPTH_UNITS).toFixed(2));
};

export const calculateArea = (
	imagePixels: ImageData,
	minX: number,
	minY: number,
	byteArray: Uint8Array,
	averageDepth: number,
) => {
	let areaAccumulator = 0;

	for (let yPos = 0; yPos < imagePixels.height; yPos++) {
		for (let xPos = 0; xPos < imagePixels.width; xPos++) {
			const dataPos = (yPos * imagePixels.width + xPos) * 4;
			const pixelRed = imagePixels.data[dataPos];
			const pixelGreen = imagePixels.data[dataPos + 1];
			const pixelBlue = imagePixels.data[dataPos + 2];

			if (pixelRed !== RED || pixelGreen !== GREEN || pixelBlue !== BLUE) continue;

			const depthPosition = ((minY + yPos) * X_CANVAS + (minX + xPos)) * 2;
			const depth = byteArray[depthPosition] + byteArray[depthPosition + 1] * 256;

			if (depth > 0) {
				areaAccumulator = areaAccumulator + getAreaAtDepth(depth);
				continue;
			}
			areaAccumulator = areaAccumulator + getAreaAtDepth(averageDepth);
		}
	}

	return parseFloat(areaAccumulator.toFixed(2));
};
