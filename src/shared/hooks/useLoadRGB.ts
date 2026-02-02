import { type ElementRef, useEffect, useRef } from 'react';
import { fetchRGBFile, fetchImageFile } from '../utils/helpers';
import { MediaReference } from '../../types/ScanTypes';

type Dimensions = {
	width: number;
	height: number;
};

{
	/* TODO: Call AWS services in the loader and use RGB here with drawRgbImage (currently used by fetchRGBFile) */
}
const useLoadRGB = (dimensions: Dimensions, mediaReference: MediaReference | undefined, patientId?: string) => {
	console.log(mediaReference);
	const imageCanvas = useRef<ElementRef<'canvas'>>(null);

	useEffect(() => {
		
		if (
			dimensions.width === imageCanvas.current?.width &&
			dimensions.height === imageCanvas.current?.height
		)
			return;
		if(patientId === '663b50ae6f9be0016d301adf')
			fetchImageFile(imageCanvas, patientId, dimensions.width, dimensions.height);
		else
			fetchRGBFile(imageCanvas, patientId!, dimensions.width, dimensions.height);
	}, [dimensions, imageCanvas.current]);

	return { imageCanvas };
};

export default useLoadRGB;
