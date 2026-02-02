import { useState, type FC } from 'react';
import { X } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import type { Scan } from '../../types/ScanTypes';
import type { Patient } from '../../types/PatientTypes';
import ScanInfoBox from './components/ScanInfoBox';
import ScanViewer from './components/ScanViewer';
import { Button } from '../../shared/components/Button';
import useDateSelection from './hooks/useDateSelection';
import { formatDate } from '../../shared/utils/helpers';

type Props = {
	patient: Patient;
	scans: Scan[];
};

const ScanHistoryModal: FC<Props> = ({ patient, scans }) => {
	const [showModal, setShowModal] = useState(false);

	const handleShowModal = () => setShowModal(prev => !prev);

	const { dateOptions, firstScan, secondScan, updateFirstDate, updateSecondDate } =
		useDateSelection(scans);

	return (
		<>
			<Button onClick={handleShowModal}>Scan History</Button>
			<Modal showModal={showModal} handleShowModal={handleShowModal}>
				<div className='flex max-h-[calc(100vh-40px)] flex-col gap-y-2 p-3.5 sm:p-5'>
					<div className='flex justify-between'>
						<div className='text-xl font-bold'>{patient.firstName + ' ' + patient.lastName}</div>
						<button type='button' onClick={handleShowModal}>
							<X size={28} />
						</button>
					</div>
					<div className='flex gap-3 overflow-y-auto max-xl:flex-col'>
						<div className='flex gap-3'>
							<div className='w-full'>
								<ScanInfoBox scan={firstScan} />
							</div>
							<div className='hidden w-full md:block xl:hidden'>
								<ScanInfoBox scan={secondScan} />
							</div>
						</div>
						<div className='flex w-full gap-3 max-md:flex-col'>
							<ScanViewer
								updateDate={updateFirstDate}
								dateOptions={dateOptions}
								value={formatDate(!!firstScan?.created ? firstScan.created : '')}
								scan={firstScan}
								patientId={patient.id}
							/>
							<ScanViewer
								updateDate={updateSecondDate}
								dateOptions={dateOptions}
								value={formatDate(!!secondScan?.created ? secondScan.created : '')}
								scan={secondScan}
								patientId={patient.id}
							/>
						</div>
						<div className='block md:hidden xl:block'>
							<ScanInfoBox scan={secondScan} />
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default ScanHistoryModal;
