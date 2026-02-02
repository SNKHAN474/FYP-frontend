import { type FC } from 'react';
import { useParams } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Button } from '../../shared/components/Button';
import CloseButton from './components/CloseButton';
import Toolbar from './components/Toolbar';
import useCalculate from './hooks/useCalculate';
import Model from './components/Model';
import { CANVAS_DIMENSIONS } from './utils/constants';
import type { Scan } from '../../types/ScanTypes';
import { PLYPointCloud } from './components/PLYPointCloud';

const { X: X_CANVAS, Y: Y_CANVAS } = CANVAS_DIMENSIONS;

const X_SIZE = 15;
const X_OFFSET = X_SIZE / 2;

type Props = {
	handleShowModal: () => void;
	scan?: Scan;
};

const ScanReview: FC<Props> = ({ handleShowModal, scan }) => {
	const {
		imageCanvas,
		drawingCanvas,
		onImageClick,
		points,
		undo,
		undoAll,
		drawMode,
		handleDrawMode,
		calculateSize,
		calculations,
		clearCalculations,
		saveCalculations,
		isCalculating,
	} = useCalculate(scan);

	return (
		<>
			<CloseButton closeModal={handleShowModal} />
			<Toolbar
				undoAll={undoAll}
				undo={undo}
				drawMode={drawMode}
				handleDrawMode={handleDrawMode}
				disabledButtons={!!calculations}
			/>
			<Button
				size='auth'
				type='button'
				disabled={points.length < 3 || !drawMode || !!calculations}
				isSubmitting={isCalculating}
				onClick={calculateSize}
				className='absolute inset-x-0 bottom-4 z-50 mx-auto w-fit'
			>
				Calculate
			</Button>
			{calculations && (
				<div className='absolute bottom-4 right-4 z-50 flex flex-col items-center gap-y-3 rounded-lg bg-white-primary p-4 text-center text-base animate-in fade-in-40'>
					<h1 className='text-lg font-bold'>Calculation Results</h1>
					<div>
						Area: {calculations.area.amount}
						mm&#178;
					</div>
					<div>
						Average Depth: {calculations.averageDepth.amount}
						mm
					</div>
					<div className='mt-auto flex gap-x-6 max-sm:hidden'>
						<Button onClick={clearCalculations} variant='slate'>
							Cancel
						</Button>
						<Button onClick={saveCalculations}>Save</Button>
					</div>
					<div className='mt-auto flex gap-x-6 sm:hidden'>
						<Button onClick={clearCalculations} variant='slate'>
							Cancel
						</Button>
						<Button onClick={saveCalculations}>Save</Button>
					</div>
				</div>
			)}

			{drawMode ? (
				<div className='relative overflow-auto'>
					<canvas ref={imageCanvas} width={X_CANVAS} height={Y_CANVAS} className='z-10' />
					<canvas
						onClick={onImageClick}
						ref={drawingCanvas}
						width={X_CANVAS}
						height={Y_CANVAS}
						className='absolute top-0 z-20'
					/>
					{points.map(({ x, y }, i) => (
						<X
							key={`point-${i}`}
							size={X_SIZE}
							className='absolute z-30 text-white-primary'
							style={{ top: y - X_OFFSET, left: x - X_OFFSET }}
						/>
					))}
				</div>
			) : (
				<Canvas shadows
				>
					<ambientLight color='black' />
					<directionalLight position={[0, 3, 3]} intensity={3} castShadow />
					<directionalLight position={[0, -3, 3]} intensity={3} castShadow />
					<PerspectiveCamera position={[60, 60, 0]} makeDefault/>
					<OrbitControls enableRotate={true} enableZoom />
					{/* Tool for Debugging */}
					{/* <axesHelper args={[5]} /> */}
					{/* TODO: Pass PLY here */}
					{ //<PCDPointCloud file={null} />
					}
					<Model />
				</Canvas>
			)}
		</>
	);
};

export default ScanReview;
