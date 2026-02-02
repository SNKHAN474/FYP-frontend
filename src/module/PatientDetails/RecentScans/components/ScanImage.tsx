import { type FC, useState } from 'react';
import useContainerDimensions from '../../../../shared/hooks/useContainerDimensions';
import useLoadRGB from '../../../../shared/hooks/useLoadRGB';
import Modal from '../../../../shared/components/Modal';
import ScanReview from '../../../ScanReview';
import type { Scan } from '../../../../types/ScanTypes';

type Props = {
	scan: Scan;
};

const ScanImage: FC<Props> = ({ scan }) => {
	const { containerRef, dimensions } = useContainerDimensions();
	const { imageCanvas } = useLoadRGB(dimensions, scan?.rgb, scan?.patientId);

	const [showModal, setShowModal] = useState(false);

	const handleShowModal = () => {
		if (window.confirm('Are you sure you want to close the modal? Your progress will be lost.'))
			setShowModal(prev => !prev);
	};

	return (
		<>
			<Modal
				canvas
				handleShowModal={handleShowModal}
				showModal={showModal}
				panelClassName='h-[480px] w-[848px] bg-slate-primary overflow-hidden'
			>
				<ScanReview handleShowModal={handleShowModal} scan={scan} />
			</Modal>
			{ !!scan ?
			<div ref={containerRef} className='w-full'>
				<canvas
					ref={imageCanvas}
					width={dimensions.width}
					height={dimensions.height}
					className='rounded-lg hover:cursor-pointer'
					onClick={() => setShowModal(true)}
				/>
			</div>
			:
			<>No Scans available</>
			}
		</>
	);
};

export default ScanImage;
