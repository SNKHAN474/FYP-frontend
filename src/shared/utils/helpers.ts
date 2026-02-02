import { type RefObject } from 'react';
import { type ClassValue, clsx } from 'clsx';
import { type FieldValues, type Path, type UseFormWatch } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { CANVAS_DIMENSIONS } from '../../module/ScanReview/utils/constants';
import { formatInTimeZone } from 'date-fns-tz';

const { X: X_CANVAS, Y: Y_CANVAS } = CANVAS_DIMENSIONS;

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const requiredFieldsAreEmpty = <TSchema extends FieldValues>(
	watch: UseFormWatch<TSchema>,
	fields: Path<TSchema>[],
) => fields.some(field => watch(field) === undefined || watch(field) === '');

// Assumes stringifed date is valid
export const formatDate = (date: Date | string | number | undefined ): string => {
	if(!!date)
		return formatInTimeZone(date, 'Europe/London', 'dd/LL/yyyy hh:mm:ss a');
	return '';
	//return format(zonedDate, pattern, { timeZone });
	//const dateCopy = new Date(date);
	//return dateCopy.toLocaleString('en-GB').split(', ')[0];
};

const drawRgbImage = (
	imageByteArray: Uint8Array,
	context: CanvasRenderingContext2D,
	scaledWidth: number,
	scaledHeight: number,
) => {
	const NUMBER_OF_RGB_VALUES = 3;
	const NUMBER_OF_RGBA_VALUES = 4;

	const imageData = context.createImageData(X_CANVAS, Y_CANVAS);
	for (let i = 0; i < imageByteArray.length; i += 3) {
		const canvasIndex = (i / NUMBER_OF_RGB_VALUES) * NUMBER_OF_RGBA_VALUES;
		imageData.data[canvasIndex] = imageByteArray[i];
		imageData.data[canvasIndex + 1] = imageByteArray[i + 1];
		imageData.data[canvasIndex + 2] = imageByteArray[i + 2];
		imageData.data[canvasIndex + 3] = 255;
	}

	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = X_CANVAS;
	tempCanvas.height = Y_CANVAS;
	tempCanvas.getContext('2d')?.putImageData(imageData, 0, 0);
	context.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight);
	tempCanvas.remove();
};

export const fetchRGBFile = async (
	imageCanvas: RefObject<HTMLCanvasElement>,
	patientId: string,
	scaledWidth = X_CANVAS,
	scaledHeight = Y_CANVAS,
) => {
	const canvas = imageCanvas.current;
	if (!canvas) return;

	const context = canvas.getContext('2d');
	if (!context) return;

	const res = await fetch(`https://mig-tasha-test.s3.eu-west-2.amazonaws.com/${patientId}/${patientId}.rbg8`);
	const buffer = await res.arrayBuffer();
	const imageByteArray = new Uint8Array(buffer);
	drawRgbImage(imageByteArray, context, scaledWidth, scaledHeight);
};

export const fetchImageFile = async (
	imageCanvas: RefObject<HTMLCanvasElement>,
	patientId: string,
	scaledWidth = X_CANVAS,
	scaledHeight = Y_CANVAS,
) => {
	const canvas = imageCanvas.current;
	if (!canvas) return;

	const context = canvas.getContext('2d');
	if (!context) return;

	let base_image = new Image();
  	base_image.src = `https://mig-tasha-test.s3.eu-west-2.amazonaws.com/${patientId}/${patientId}.jpg`;
	console.log('base_image.src', base_image.src);
	base_image.onload = function(){
	context.drawImage(base_image, 0, 0, scaledWidth, scaledHeight);
	}
};
