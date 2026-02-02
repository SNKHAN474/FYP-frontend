import { useEffect, useState, type FC } from 'react';
import { updatePatient } from '../../shared/api/services/patientService';
import Accordion from '../../shared/components/Accordion';
import { Patient, ClinicianNotes } from '../../types/PatientTypes';
import { useRouteContext } from '@tanstack/react-router';
import { Button } from '../../shared/components/Button';

type Props = {
	patient: Patient;
};

const CliniciansNotes: FC<Props> = ({ patient }) => {
	const context = useRouteContext({ from: '/_protected' });
	const [notes, setNotes] = useState<string>('');
	useEffect(() => {
		setNotes(!!patient.clinicianNotes && patient.clinicianNotes.length > 0 ? (patient.clinicianNotes[patient.clinicianNotes.length - 1] as ClinicianNotes).notes : '');
	}, [patient])

	return <Accordion animationDuration={0.3} title='NOTES'>
		<textarea
			className='h-52 w-full resize-none rounded-lg border border-slate-border p-1 outline-none hover:cursor-pointer focus:cursor-auto focus:border-slate-secondary'
			placeholder='Add your notes here'
			id='clinician-note'
			defaultValue={notes}
			/*
			onBlur={async (e) => {
				await updatePatient(context.token!, { ...patient, clinicianNotes: e.target.value })
			}}
			onKeyDown={e => {
				if (e.key === 'Escape') {
					(e.target as HTMLInputElement).blur();
				}
			}}
			*/
		/>
		<Button
			type='button'
			size='modal'
			className='mt-3 place-self-end'
			onClick={async () => {
				await updatePatient(context.token!, { ...patient, clinicianNotes: (document.getElementById('clinician-note') as HTMLInputElement)!.value })
			}}
		>
			Save
		</Button>
	</Accordion>
};

export default CliniciansNotes;
