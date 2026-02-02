import { type MouseEvent, useRef, useState, useEffect, ElementRef } from 'react';
import { calculateAverageDepth, calculateArea, findMinMaxOfPoints } from '../utils/helpers';
import type { Point } from '../utils/types';
import { AREA_BG_COLOR } from '../utils/constants';
import type { Annotation, Scan } from '../../../types/ScanTypes';
import { fetchRGBFile } from '../../../shared/utils/helpers';
import { createAnnotationConfig } from '../../../api/apiConfig';
import { useParams, useRouteContext } from '@tanstack/react-router';
import { axiosClient } from '../../../utils/axiosClient';

type NewAnnotation = Omit<Annotation, 'created'>;

{
	/* TODO: Call AWS services in the loader and use RGB here with drawRgbImage (currently used by fetchRGBFile)
	and use depth16 file at beginning of calculate size function */
}

const useCalculate = (scan: Scan | undefined) => {
	const appContext = useRouteContext({ from: '/_protected' });
	const { patientId } = useParams({ from: '/_protected/patients/$patientId' });
	const imageCanvas = useRef<ElementRef<'canvas'>>(null);
	const drawingCanvas = useRef<ElementRef<'canvas'>>(null);

	const [drawMode, setDrawMode] = useState(false);
	const [calculations, setCalculations] = useState<NewAnnotation>();
	const [points, setPoints] = useState<Point[]>([]);
	const [isCalculating, setIsCalculating] = useState(false);

	const drawArea = (points: Point[]) => {
		const canvas = drawingCanvas.current;
		if (!canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		context.clearRect(0, 0, canvas.width, canvas.height);

		if (points.length < 3) return;

		context.beginPath();
		context.moveTo(points[0].x, points[0].y);

		points.slice(1).forEach(({ x, y }) => context.lineTo(x, y));

		context.closePath();

		context.fillStyle = `${AREA_BG_COLOR}50`;
		context.fill();

		context.strokeStyle = AREA_BG_COLOR;
		context.lineWidth = 2;
		context.stroke();
	};

	const onImageClick = (e: MouseEvent<HTMLCanvasElement>) => {
		if (!drawMode || !!calculations) return;
		const canvas = imageCanvas.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const xPos = Math.round(e.clientX - rect.left);
		const yPos = Math.round(e.clientY - rect.top);

		const newPoint = { x: xPos, y: yPos };
		const newPoints = points.concat(newPoint);

		setPoints(newPoints);
	};

	const calculateSize = async () => {
		setIsCalculating(true);
		const res = await fetch(`https://mig-tasha-test.s3.eu-west-2.amazonaws.com/${patientId}/${patientId}.depth16`);
		const buffer2 = await res.arrayBuffer();
		const byteArray = new Uint8Array(buffer2);

		const canvas = drawingCanvas.current;
		if (!canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);

		points.slice(1).forEach(({ x, y }) => context.lineTo(x, y));

		context.closePath();

		context.fillStyle = AREA_BG_COLOR;
		context.fill();

		const { minX, minY, maxX, maxY } = findMinMaxOfPoints(points);

		const width = maxX - minX;
		const height = maxY - minY;
		const imagePixels = context.getImageData(minX, minY, width, height);

		const averageDepth = calculateAverageDepth(imagePixels, minX, minY, byteArray);

		const area = calculateArea(imagePixels, minX, minY, byteArray, averageDepth);

		const calculations: NewAnnotation = {
			area: {
				amount: area,
				unit: 'MILLIMETERS',
			},
			averageDepth: {
				amount: averageDepth,
				unit: 'MILLIMETERS',
			},
		};

		setCalculations(calculations);
		setIsCalculating(false);
	};

	const clearCalculations = () => {
		setCalculations(undefined);
	};

	const saveCalculations = async () => {
		// TODO: SAVE CALCULATIONS
		const calculatedAnnotations = {
			patientId: scan?.patientId,
			scanId: scan?.id,
			...calculations
		}
		const createAnnotationConfigWithBody = {
			...createAnnotationConfig(appContext.token!),
			body: calculatedAnnotations,
		  };
	
		await axiosClient(createAnnotationConfigWithBody);
		clearCalculations();
	};

	const undo = () => {
		setPoints(prev => prev.slice(0, -1));
	};

	const undoAll = () => {
		setPoints([]);
	};

	const handleDrawMode = () => {
		setDrawMode(prev => !prev);
	};

	useEffect(() => {
		if (!drawMode) return;
		fetchRGBFile(imageCanvas, patientId);
	}, [drawMode, calculations]);

	useEffect(() => {
		if (!drawMode) return;
		drawArea(points);
	}, [points, drawMode, calculations]);

	return {
		imageCanvas,
		undo,
		undoAll,
		onImageClick,
		points,
		drawMode,
		handleDrawMode,
		calculateSize,
		drawingCanvas,
		calculations,
		clearCalculations,
		saveCalculations,
		isCalculating,
	};
};

export default useCalculate;
