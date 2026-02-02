import { useEffect, useState } from 'react';
import type { BufferGeometry, NormalBufferAttributes } from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';

const loader = new PLYLoader();
const pcdLoader = new PCDLoader();

const useModel = () => {
	const [model, setModel] = useState<any | null>(null);

	useEffect(() => {
		loader.load('/models/rescaled_foot.ply', object => {
			setModel(object);
		});
	}, []);

	useEffect(() => {
		//model?.computeVertexNormals();
	}, [model]);

	return {
		model,
	};
};

export default useModel;
