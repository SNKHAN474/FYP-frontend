import { FC } from 'react';
import InfoRow from '../../shared/components/InfoRow';
import { Patient } from '../../types/PatientTypes';
import ScanHistoryModal from '../ScanHistoryModal';
import { Scan } from '../../types/ScanTypes';

type Props = {
	patient: Patient;
	scans: Scan[];
};

const PatientInfoBox: FC<Props> = ({ patient, scans }) => (
	<div className='flex flex-col justify-evenly gap-y-3 rounded-lg border border-slate-border bg-white-primary p-3'>
		<div>
			<ScanHistoryModal patient={patient} scans={scans} />
		</div>
		<h1 className='text-lg font-bold'>{patient.firstName + ' ' + patient.lastName}</h1>
		<div className='space-y-2'>
			<InfoRow header='GENDER' value={patient.gender} />
			<InfoRow header='HEIGHT' value={patient.height + 'cm'} />
			<InfoRow header='WEIGHT' value={patient.weight + 'kg'} />
			<InfoRow header='BMI' value={Math.round(patient.weight/(patient.height * patient.height) *10000)} />
		</div>
	</div>
);

export default PatientInfoBox;
