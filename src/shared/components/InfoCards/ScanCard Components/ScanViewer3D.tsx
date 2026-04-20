import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import earcut from 'earcut';

interface ScanViewer3DProps {
	plyPath: string;
	autoCenter?: boolean;
	onClose?: () => void; // optional now
}

const ScanViewer3D: React.FC<ScanViewer3DProps> = ({ plyPath, autoCenter = true, onClose }) => {
	const mountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = mountRef.current;
		if (!container) return;

		// ---------- SCENE ----------
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x111111);

		// ---------- CAMERA ----------
		const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1000);

		// ---------- RENDERER ----------
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		container.appendChild(renderer.domElement);

		// ---------- SIZE HANDLING ----------
		const resize = () => {
			const width = container.clientWidth;
			const height = container.clientHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			renderer.setSize(width, height);
		};

		resize();
		window.addEventListener('resize', resize);

		// ---------- CONTROLS ----------
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		// ---------- INTERACTION ----------
		const raycaster = new THREE.Raycaster();
		raycaster.params.Points!.threshold = 0.01;

		const mouse = new THREE.Vector2();

		const clickedPoints: THREE.Vector3[] = [];
		const markers: THREE.Mesh[] = [];

		let line: THREE.Line | null = null;
		let pointsMesh: THREE.Points;

		function clearMarkers() {
			markers.forEach(m => scene.remove(m));
			markers.length = 0;
		}

		function addMarker(pos: THREE.Vector3) {
			const geo = new THREE.SphereGeometry(0.0015, 8, 8);
			const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
			const m = new THREE.Mesh(geo, mat);
			m.position.copy(pos);
			scene.add(m);
			markers.push(m);
		}

		function drawLine() {
			if (line) scene.remove(line);

			let pts = [...clickedPoints];
			if (clickedPoints.length >= 3) pts.push(clickedPoints[0]);

			const geo = new THREE.BufferGeometry().setFromPoints(pts);
			const mat = new THREE.LineBasicMaterial({ color: 0x00ff00 });

			line = new THREE.Line(geo, mat);
			scene.add(line);
		}

		function getPerimeter() {
			let total = 0;
			for (let i = 0; i < clickedPoints.length; i++) {
				const next = clickedPoints[(i + 1) % clickedPoints.length];
				total += clickedPoints[i].distanceTo(next);
			}
			return total;
		}

		function projectToPlane(points: THREE.Vector3[]) {
			const centroid = new THREE.Vector3();
			points.forEach(p => centroid.add(p));
			centroid.divideScalar(points.length);

			const normal = new THREE.Vector3(0, 0, 1);
			const u = new THREE.Vector3(1, 0, 0);
			const v = new THREE.Vector3().crossVectors(normal, u).normalize();

			return points.map(p => {
				const d = p.clone().sub(centroid);
				return [d.dot(u), d.dot(v)];
			});
		}

		function computeArea(points: THREE.Vector3[]) {
			if (points.length < 3) return 0;

			const flat = projectToPlane(points).flat();
			const indices = earcut(flat);

			let area = 0;

			for (let i = 0; i < indices.length; i += 3) {
				const a = points[indices[i]];
				const b = points[indices[i + 1]];
				const c = points[indices[i + 2]];

				const ab = b.clone().sub(a);
				const ac = c.clone().sub(a);

				area += ab.cross(ac).length() / 2;
			}

			return area;
		}

		function updateMeasurements() {
			if (clickedPoints.length < 2) return;

			drawLine();

			console.log('Perimeter:', getPerimeter().toFixed(4), 'm');

			if (clickedPoints.length >= 3) {
				console.log('Area:', computeArea(clickedPoints).toFixed(6), 'm²');
			}
		}

		function onClick(event: MouseEvent) {
			const rect = renderer.domElement.getBoundingClientRect();

			mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);

			const intersects = raycaster.intersectObject(pointsMesh);

			if (intersects.length > 0) {
				const point = intersects[0].point.clone();
				clickedPoints.push(point);
				addMarker(point);
				updateMeasurements();
			}
		}

		renderer.domElement.addEventListener('click', onClick);

		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape' && onClose) onClose();

			if (e.key === 'c') {
				clickedPoints.length = 0;
				clearMarkers();
				if (line) scene.remove(line);
			}

			if (e.key === 'z') {
				clickedPoints.pop();
				clearMarkers();
				clickedPoints.forEach(addMarker);
				updateMeasurements();
			}
		}

		window.addEventListener('keydown', onKey);

		// ---------- LOAD MODEL ----------
		const loader = new PLYLoader();

		const basePath = 'C:/Users/shahk/Documents/UCL/Y4/fyp/FYP/New folder';
		const relative = plyPath.replace(/\\/g, '/').split(basePath.replace(/\\/g, '/'))[1];
		const plyUrl = `http://localhost:3000/files${relative}`;

		loader.load(plyUrl, geometry => {
			geometry.computeVertexNormals();

			if (autoCenter) {
				geometry.computeBoundingBox();
				geometry.computeBoundingSphere();

				const center = new THREE.Vector3();
				geometry.boundingBox?.getCenter(center);
				geometry.translate(-center.x, -center.y, -center.z);

				const radius = geometry.boundingSphere?.radius || 1;
				const fov = camera.fov * (Math.PI / 180);
				const dist = radius / Math.sin(fov / 2);

				camera.position.set(0, 0, dist * 1.2);
				camera.lookAt(0, 0, 0);

				controls.target.set(0, 0, 0);
				controls.update();
			}

			const material = new THREE.PointsMaterial({
				size: 0.005,
				vertexColors: true,
			});

			pointsMesh = new THREE.Points(geometry, material);
			scene.add(pointsMesh);
		});

		// ---------- LOOP ----------
		const animate = () => {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		};
		animate();

		// ---------- CLEANUP ----------
		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('keydown', onKey);
			renderer.dispose();

			if (container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		};
	}, [plyPath, autoCenter, onClose]);

	return (
		<div className='bg-black relative h-[480px] w-full overflow-hidden rounded-lg'>
			{onClose && (
				<button
					onClick={onClose}
					className='bg-white hover:bg-red-500 hover:text-white absolute right-3 top-3 z-10 rounded px-3 py-1 text-xs font-bold'
				>
					CLOSE
				</button>
			)}
			<div ref={mountRef} className='h-full w-full' />
		</div>
	);
};

export default ScanViewer3D;
