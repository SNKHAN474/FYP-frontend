import { LinkOptions, createFileRoute } from '@tanstack/react-router';
import { getPatient } from '../../shared/api/services/patientService';
import DiabetesInfoBox from '../../module/PatientDetails/DiabetesInfoBox';
import PatientInfoBox from '../../module/PatientDetails/PatientInfoBox';
import RecentScans from '../../module/PatientDetails/RecentScans';
import PersonalDetails from '../../module/PatientDetails/PersonalDetails';
import CliniciansNotes from '../../module/PatientDetails/CliniciansNotes';
import Accordion from '../../shared/components/Accordion';

const PatientDetails = () => {
	const { patient } = Route.useLoaderData();
	//console.log('Patient Info', patient);
	return (
		<div className='flex max-w-7xl flex-col gap-7 lg:flex-row'>
			<div className='flex w-full flex-col gap-7 lg:max-w-80'>
				<PatientInfoBox patient={patient} scans={patient.scans} />
				<DiabetesInfoBox {...patient.diabetesDetails} />
				<Accordion animationDuration={0.15} title='Medications Info'>
					<div className='text-sm font-bold'>
						{patient.diabetesDetails.medicationsInfo || '---'}
					</div>
				</Accordion>
			</div>
			<div className='flex w-full flex-col gap-7'>
				<RecentScans scans={patient.scans} patientId={patient.id}/>
				<PersonalDetails patient={patient} />
				<CliniciansNotes patient={patient} />
			</div>
		</div>
	);
};

export const Route = createFileRoute('/_protected/patients/$patientId')({
	component: PatientDetails,
	loader: async ({ context, params }) => {
		//console.log('params patientid', params.patientId);
		context.pageName = 'Patient Medical Details';
		context.returnLink = '/patients' as Exclude<LinkOptions['to'], undefined>;
		const patientData = await getPatient(context.token!, params.patientId);
		return { patient: patientData };
	},
});
