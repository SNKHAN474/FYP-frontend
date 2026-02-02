import { FC, useMemo } from 'react';
import patientsData from '../../data/dummy_data.json';
import StatusPill from './StatusPill';
import { formatDate } from '../../shared/utils/helpers';
import { Eye, Edit2 } from 'lucide-react';

type Patient = {
	name: string;
	age: number;
	id: string;
	startDate: string;
	lastVisit: string;
	nextVisit: string;
	ulcerGrade: string;
	status: string;
	scanStatus: string;
	flag?: boolean;
};

type Props = {
	filterByScanStatus?: string;
	onPatientSelect?: (patientId: string) => void;
	statusFilter?: string;
	ulcerGradeFilter?: string;
	searchTerm?: string;
	sortBy?: string;
};

// CardRow component for consistent layout

const CardRow = ({
	header,
	value,
}: {
	header: string;
	value: string | number | React.ReactNode;
}) => (
	<div className='border-b border-slate-border pb-5'>
		<div className='grid grid-cols-2'>
			<div className='text-sm text-slate-secondary'>{header}</div>
			<div className='text-center font-bold'>{value}</div>
		</div>
	</div>
);

const PatientsCards: FC<Props> = ({
	filterByScanStatus,
	onPatientSelect,
	statusFilter = '',
	ulcerGradeFilter = '',
	searchTerm = '',
	sortBy = '',
}) => {
	// Get patients from dummy data
	const allPatients = patientsData.patients as Patient[];

	// Use useMemo to filter and sort patients efficiently
	const patients = useMemo(() => {
		let filtered = [...allPatients];

		// Filter by scan status
		if (filterByScanStatus) {
			filtered = filtered.filter(patient => patient.scanStatus === filterByScanStatus);
		}

		// Filter by status
		if (statusFilter) {
			filtered = filtered.filter(patient => patient.status === statusFilter);
		}

		// Filter by ulcer grade (check if grade is in the string)
		if (ulcerGradeFilter) {
			filtered = filtered.filter(patient => patient.ulcerGrade.includes(ulcerGradeFilter));
		}

		// Filter by search term (name)
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(patient => patient.name.toLowerCase().includes(term));
		}

		// Sort patients
		if (sortBy) {
			filtered.sort((a, b) => {
				switch (sortBy) {
					case 'name':
						return a.name.localeCompare(b.name);
					case 'age':
						return b.age - a.age; // Descending age
					case 'nextVisit':
						// Parse dates for comparison (dd/mm/yyyy)
						const dateA = a.nextVisit.split('/').reverse().join('-');
						const dateB = b.nextVisit.split('/').reverse().join('-');
						return new Date(dateA).getTime() - new Date(dateB).getTime();
					case 'lastVisit':
						const lastDateA = a.lastVisit.split('/').reverse().join('-');
						const lastDateB = b.lastVisit.split('/').reverse().join('-');
						return new Date(lastDateB).getTime() - new Date(lastDateA).getTime(); // Descending
					case 'startDate':
						const startDateA = a.startDate.split('/').reverse().join('-');
						const startDateB = b.startDate.split('/').reverse().join('-');
						return new Date(startDateB).getTime() - new Date(startDateA).getTime(); // Descending
					default:
						return 0;
				}
			});
		}

		return filtered;
	}, [allPatients, filterByScanStatus, statusFilter, ulcerGradeFilter, searchTerm, sortBy]);

	const isValidStatus = (status: string): status is 'New' | 'Active' | 'In-Active' | 'Warning' => {
		return ['New', 'Active', 'In-Active', 'Warning'].includes(status);
	};

	const formatDummyDate = (dateString: string) => {
		if (!dateString) return 'N/A';
		const [day, month, year] = dateString.split('/');
		const date = new Date(`${year}-${month}-${day}`);
		return formatDate(date);
	};

	// Show empty state if no patients after filtering
	if (patients.length === 0) {
		return (
			<div className='rounded-lg border-2 border-dashed border-slate-border bg-white-primary p-8 text-center lg:hidden'>
				<p className='text-lg font-medium text-slate-secondary'>No patients found</p>
				<p className='text-slate mt-2 text-sm font-normal'>
					{filterByScanStatus || statusFilter || ulcerGradeFilter || searchTerm
						? 'No patients match your filters'
						: 'No patients available'}
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-5 lg:hidden'>
			{/* Optional: Show active filter summary */}
			{(statusFilter || ulcerGradeFilter || searchTerm || filterByScanStatus) && (
				<div className='bg-blue-50 text-blue-700 rounded-lg p-3 text-sm'>
					<span className='font-semibold'>Active filters:</span>
					{statusFilter && (
						<span className='bg-blue-100 ml-2 rounded px-2 py-1 font-normal'>
							Status: {statusFilter}
						</span>
					)}
					{ulcerGradeFilter && (
						<span className='bg-blue-100 ml-2 rounded px-2 py-1 font-normal'>
							Grade: {ulcerGradeFilter}
						</span>
					)}
					{searchTerm && (
						<span className='bg-blue-100 ml-2 rounded px-2 py-1 font-normal'>
							Search: "{searchTerm}"
						</span>
					)}
					{filterByScanStatus && (
						<span className='bg-blue-100 ml-2 rounded px-2 py-1 font-normal'>
							Scan: {filterByScanStatus}
						</span>
					)}
				</div>
			)}

			{patients.map(patient => (
				<div
					key={`patient-${patient.id}`}
					className='bg-white flex flex-col overflow-hidden rounded-lg border border-slate-faded shadow-lg'
				>
					<div className='bg-white-primary p-5'>
						<div className='space-y-5'>
							{/* Patient Information Rows */}
							<CardRow header='NAME' value={patient.name} />
							<CardRow header='#ID' value={patient.id.slice(0, 8)} />
							<CardRow header='AGE' value={`${patient.age} years`} />
							<CardRow header='ULCER GRADE' value={patient.ulcerGrade.trim() || 'None'} />

							{/* Date Rows */}
							<CardRow header='TREATMENT START DATE' value={formatDummyDate(patient.startDate)} />
							<CardRow header='NEXT VISIT DATE' value={formatDummyDate(patient.nextVisit)} />
							<CardRow header='LAST VISIT DATE' value={formatDummyDate(patient.lastVisit)} />

							{/* Status Rows */}
							<div className='border-b border-slate-border pb-5'>
								<div className='grid grid-cols-2'>
									<div className='text-sm text-slate-secondary'>STATUS</div>
									<div className='flex justify-center font-bold'>
										{isValidStatus(patient.status) ? (
											<StatusPill status={patient.status} />
										) : (
											<span className='rounded-full bg-slate-border px-3 py-1 text-xs font-normal text-slate-secondary'>
												{patient.status}
											</span>
										)}
									</div>
								</div>
							</div>

							<div className='border-b border-slate-border pb-5'>
								<div className='grid grid-cols-2'>
									<div className='text-sm text-slate-secondary'>SCAN STATUS</div>
									<div className='flex justify-center font-bold'>
										<span
											className={`rounded-full border px-3 py-1 text-xs font-normal ${
												patient.scanStatus === 'To Review'
													? 'border-orange-200 bg-orange-50 text-orange-700'
													: patient.scanStatus === 'Reviewed'
														? 'border-green-200 bg-green-50 text-green-700'
														: patient.scanStatus === 'Annotated'
															? 'border-purple-200 bg-purple-50 text-purple-700'
															: patient.scanStatus === 'To Annotate'
																? 'border-yellow-200 bg-yellow-50 text-yellow-700'
																: 'bg-slate-border text-slate-secondary'
											}`}
										>
											{patient.scanStatus}
										</span>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className='flex gap-x-2 pt-2'>
								<button
									onClick={e => {
										e.stopPropagation();
										onPatientSelect?.(patient.id);
									}}
									className='hover:bg-blue-50 flex items-center justify-center gap-2 rounded-lg border border-blue-primary bg-white-primary px-4 py-2 font-medium text-blue-primary'
								>
									<Eye size={16} />
									View Details
								</button>
								<button
									onClick={e => {
										e.stopPropagation();
										window.location.href = `/patients?mode=Edit&patientId=${patient.id}`;
									}}
									className='hover:bg-slate-50 flex items-center justify-center gap-2 rounded-lg border border-slate-border bg-white-primary px-4 py-2 font-medium text-slate-secondary'
								>
									<Edit2 size={16} />
									Edit
								</button>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default PatientsCards;
