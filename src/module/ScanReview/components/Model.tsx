import { Loader2 } from 'lucide-react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { useParams } from '@tanstack/react-router';

const Model = () => {
	//const { model } = useModel();
	//const {scene} = useGLTF('/models/Pfoot.gltf');
	//const buffer = useLoader(THREE.FileLoader, '/models/Pfoot.obj');
  	//const obj = useMemo(() => new OBJLoader().parse(THREE.LoaderUtils.decodeText(buffer as any)), [buffer])
	//const obj = useLoader(OBJLoader, '/models/Pfoot.obj')
	
	const { scene }= useThree();
	const { patientId } = useParams({ from: '/_protected/patients/$patientId' });
	const plyLoader = new PLYLoader();

	plyLoader.load(`https://mig-tasha-test.s3.eu-west-2.amazonaws.com/${patientId}/${patientId}.ply`, async function ( geometry ) {
			var material = new THREE.PointsMaterial( { size: 0.5 } );
			material.vertexColors = true //if has colors geometry.attributes.color.count > 0
			var mesh = new THREE.Points(geometry, material)
			scene.add(mesh)
		}
	);

	return null;
	
	/*
	return isLoading ?
			(
				<Html as='div' className='absolute -left-6 -top-6'>
					<Loader2 className='h-12 w-12 animate-spin text-white-primary' />;
				</Html>
			) 
		:
			null
	
	
	return (
		<mesh geometry={model} scale={0.02} position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
			<meshToonMaterial color={'yellow'} />
		</mesh>
	);
	*/
	
	//return <primitive object={obj} dispose={null}/>
};

export default Model;
