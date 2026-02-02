export type MediaReference = { bucket: string; key: string };

export type Annotation = {
	created: string;
	area: { amount: number; unit: string };
	averageDepth: { amount: number; unit: string };
};

export type Scan = {
	id: string;
	patientId: string;
	created: string;
	ply: MediaReference;
	rgb: MediaReference;
	rgbd: MediaReference;
	patientComments: string;
	annotations: Annotation[];
	images: MediaReference[];
	glucoseLiveReadings: number;
};
