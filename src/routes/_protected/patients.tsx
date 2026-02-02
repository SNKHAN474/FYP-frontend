import {  useState, useEffect } from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { Search, UserRoundPlus } from 'lucide-react';
import PatientsTable from '../../module/PatientsPage/PatientsTable';
import PatientModal from '../../module/PatientsPage/PatientModal';
import { EditingPatient, PatientWithoutScans } from '../../types/PatientTypes';
import { axiosClient } from '../../utils/axiosClient';
import { getPatientsConfig } from '../../api/apiConfig';
import PatientsCards from '../../module/PatientsPage/PatientsCards';

const Patients = () => {
	//const { isLoading, isAuthenticated } = useAuth0();
	const navigate = useNavigate({ from: Route.fullPath });
	const { patients, editingPatient, mode, token } = Route.useLoaderData();

	const [filteredPatients, setFilteredPatients] = useState(patients);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value.toLowerCase();
		const filteredPatients = patients.filter(patient => {
			const name = patient.firstName.toLowerCase() + ' ' + patient.lastName.toLowerCase();
			//const id = patient.sequenceNumber.toString().toLowerCase();
			return name.includes(searchValue);
		});
		setFilteredPatients(filteredPatients);
	};

	
	useEffect(() => {
		setFilteredPatients(patients);
	}, [patients])
	
	
	//console.log('Loading Patients')
	console.log("patients data", patients);

	return (
		<div className='flex h-full flex-col gap-y-10'>
			<div className='flex justify-between gap-y-3 max-lg:flex-col max-lg:items-center'>
				<div className='relative h-[46px] w-full max-w-80'>
					<input
						placeholder='Search by name or id'
						onChange={handleSearch}
						className='flex h-full w-full rounded-xl border border-slate-border bg-white-primary py-2 pl-11 pr-2 text-sm placeholder:text-slate-secondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
					/>
					<Search size={20} className='absolute inset-y-0 left-4 my-auto' />
				</div>
				<Link
					to='/patients'
					search={() => ({ mode: 'Add' as const })}
					className='flex w-full max-w-80 items-center gap-x-2 rounded-xl border border-blue-primary bg-white-primary px-4  py-2 text-blue-primary lg:w-56 lg:justify-center'
					preload={false}
				>
					<UserRoundPlus size={20} />
					Add Patient
				</Link>
			</div>
			<div className='grow max-lg:hidden'>
				<PatientsTable patients={filteredPatients} />
			</div>
			
			<div className='space-y-10 lg:hidden'>
				<PatientsCards patients={filteredPatients} />
			</div>
			
			<PatientModal
				handleShowModal={() => navigate({ search: {} })}
				mode={mode}
				token={token}
				patient={editingPatient}
			/>
		</div>
	);
};

const getValueOrEmpty = (val: string | Date | undefined) => {
	return !!val ? (val as string).substring(0, 10) : 'Empty';
}

const convertPatientForForm = (patient: PatientWithoutScans): EditingPatient => {
	const { diabetesDetails } = patient;
	return {
		...patient,
		lastVisitDate: getValueOrEmpty(patient.lastVisitDate),
		birthDate: getValueOrEmpty(patient.birthDate),
		treatmentStartDate: getValueOrEmpty(patient.treatmentStartDate),
		nextVisitDate: getValueOrEmpty(patient.nextVisitDate),
		//clinicianNotes: patient.clinicianNotes as string,
		diabetesDetails: {
			...diabetesDetails,
			previousAmputation: diabetesDetails.previousAmputation ? 'true' : 'false',
			medications: diabetesDetails.medications ? 'true' : 'false',
			lastHbA1cDate: getValueOrEmpty(diabetesDetails.lastHbA1cDate),
			lastLipidProfileDate: getValueOrEmpty(diabetesDetails.lastLipidProfileDate),
			latestBpDate: getValueOrEmpty(diabetesDetails.latestBpDate),
		},
	};
};

export type QueryParams =
	| { mode: 'Edit'; patientId: string; state?: string }
	| { mode?: 'Add'; patientId?: undefined; state?: string }

const queryParamsAreValid = (search: Record<string, unknown>): search is QueryParams => {
	const { mode, patientId } = search;
	return !!(
		(mode === 'Edit' && patientId) ||
		(mode === 'Add' && !patientId) ||
		(!mode && !patientId)
	);
};

export const Route = createFileRoute('/_protected/patients')({
	component: Patients,
	validateSearch: (search: Record<string, unknown>): QueryParams => search,
	beforeLoad: ({ search }) => {
		if (!queryParamsAreValid(search)) {
			throw redirect({ search: {} });
		}
		if (search.mode === 'Edit') {
			return { mode: search.mode, patientId: search.patientId };
		}
		if (search.state) {
			window.history.replaceState({}, document.title, window.location.pathname);
		}
		return {mode: search.mode};
	},
	loader: async ({ context }) => {
		context.pageName = 'Patients';
		//console.log('context auth', context.
		// isAuthenticated);
		//console.log('context token', context.token);
		let patients: Array<PatientWithoutScans> = [];
		if(!!context.token)
			patients = await axiosClient(getPatientsConfig(context.token));
		//const patients = getPatients();

		if (context.mode === 'Edit' && !!context.token) {
			const editingPatient = patients.find(patient => patient.id === context.patientId);

			if (!editingPatient) {
				throw new Error('Patient not found');
			}

			return {
				patients,
				editingPatient: convertPatientForForm(editingPatient),
				mode: context.mode,
				token: context.token
			};
		}
		return { patients, mode: context.mode, token: context.token };
	},
});
