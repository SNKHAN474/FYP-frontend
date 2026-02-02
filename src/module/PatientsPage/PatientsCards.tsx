import { FC } from 'react';
import PatientStatus from './PatientStatus';
import PatientLinkEdit from './PatientLinkEdit';
import { PatientWithoutScansAndNotes } from '../../types/PatientTypes';
import { formatDate } from '../../shared/utils/helpers';
import PatientLinkView from './PatientLinkView';

type Props = {
	patients: PatientWithoutScansAndNotes[];
};

const CardRow = ({ header, value }: { header: string; value: string | number }) => (
	<div className='border-b border-slate-border pb-5'>
		<div className='grid grid-cols-2'>
			<div className='text-sm text-slate-secondary'>{header}</div>
			<div className='text-center font-bold'>{value}</div>
		</div>
	</div>
);

const PatientsCards: FC<Props> = ({ patients }) => {
	console.log("Patients Data cards", patients);

	return <>
		{patients.map(patient => (
			<div
				key={`patient-${patient.id}`}
				className='flex flex-col gap-y-5 rounded-lg border border-slate-faded p-5 shadow-lg'
			>
				<CardRow header='NAME' value={patient.firstName + ' ' + patient.lastName} />
				<CardRow header='#ID' value={''} />
				<CardRow header='TREATMENT START DATE' value={formatDate(patient.treatmentStartDate)} />
				<CardRow header='NEXT VISIT DATE' value={formatDate(patient.nextVisitDate)} />
				<CardRow header='LAST VISIT DATE' value={formatDate(patient.lastVisitDate)} />
				<div className='border-b border-slate-border pb-5'>
					<div className='grid grid-cols-2'>
						<div className='text-sm text-slate-secondary'>STATUS</div>
						<div className='flex justify-center font-bold'>
							<PatientStatus status={patient.status} />
						</div>
					</div>
				</div>
				<div className='flex gap-x-2'>
					<PatientLinkView id={patient.id} />
					<PatientLinkEdit id={patient.id} card />
				</div>
			</div>
		))}
	</>
};

export default PatientsCards;
