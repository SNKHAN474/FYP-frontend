import { Annotation, Scan } from '../../../types/ScanTypes';

export const createScanAnnotation = (
	scanId: Scan['id'],
	annotation: Omit<Annotation, 'created'>,
) => {
	console.log(scanId, annotation);
};
