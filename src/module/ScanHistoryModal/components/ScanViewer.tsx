import { type FC, useState } from 'react';
import Dropdown from '../../../shared/components/Dropdown';
import type { Scan } from '../../../types/ScanTypes';
import useLoadRGB from '../../../shared/hooks/useLoadRGB';
import useContainerDimensions from '../../../shared/hooks/useContainerDimensions';
import Modal from '../../../shared/components/Modal';
import ScanReview from '../../ScanReview';

type Props = {
	updateDate: (value: string) => void;
	dateOptions: { label: string; value: string }[];
	value: string;
	scan: Scan | undefined;
	patientId: string;
};

const ScanViewer: FC<Props> = props => {
	const { value, dateOptions, updateDate, scan, patientId } = props; 
	const { containerRef, dimensions } = useContainerDimensions();
	const { imageCanvas } = useLoadRGB(dimensions, scan?.rgb, patientId);

	const [showModal, setShowModal] = useState(false);

	const handleShowModal = () => {
		if (window.confirm('Are you sure you want to close the modal? Your progress will be lost.'))
			setShowModal(prev => !prev);
	};

	return (
		<div className='flex w-full flex-col gap-y-2'>
			<Modal
				canvas
				handleShowModal={handleShowModal}
				showModal={showModal}
				panelClassName='h-[480px] w-[848px] bg-slate-primary overflow-hidden'
			>
				<ScanReview handleShowModal={handleShowModal} scan={scan} />
			</Modal>
			<div ref={containerRef}>
				<canvas
					ref={imageCanvas}
					width={dimensions.width}
					height={dimensions.height}
					className='rounded-lg hover:cursor-pointer'
					onClick={() => setShowModal(true)}
				/>
			</div>
			<Dropdown
				hideErrors
				direction='up'
				placeholderLabel='Choose Date'
				value={value}
				updateValue={updateDate}
				options={dateOptions}
			/>
		</div>
	);
};

export default ScanViewer;
