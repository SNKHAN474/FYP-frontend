import React, { useState, useEffect } from 'react';
import { Eye, Flag, Plus } from 'lucide-react';
import StatusPill from './StatusPill';
import patientsData from '../../data/dummy_data.json';
import { Button } from './Button';
import TextInput from './TextInput';
import PatientsTableFilters from './PatientTableFilters';
import { usePatientsFilter } from './usePatientsFilter';

type Patient = {
	name: string;
	age: number;
	id: string;
	startDate: string;
	lastVisit: string;
	nextVisit: string;
	ulcerGrade: string;
	status: 'New' | 'Active' | 'In-Active' | 'Warning';
	flag?: boolean;

	scanStatus?: string; // NEW FIELD
};

type SortOption = 'nextVisit' | 'lastVisit' | 'startDate' | 'name' | 'age';

type PatientsTableProps = {
	filterByScanStatus?: string; // NEW OPTIONAL PROP
};

const PatientsTable: React.FC<PatientsTableProps> = ({ filterByScanStatus }) => {
	// Load patients
	let patients = patientsData.patients as Patient[];

	// OPTIONAL AUTO-FILTER BY SCAN STATUS
	if (filterByScanStatus) {
		patients = patients.filter(
			p => p.scanStatus && p.scanStatus.toLowerCase() === filterByScanStatus.toLowerCase(),
		);
	}

	// Pagination state
	const [currentPage, setCurrentPage] = useState(0);
	const [pageInput, setPageInput] = useState('1');
	const patientsPerPage = 10;

	// Filter states
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [ulcerGradeFilter, setUlcerGradeFilter] = useState<string>('');
	const [sortBy, setSortBy] = useState<SortOption>('nextVisit');
	const [searchTerm, setSearchTerm] = useState('');

	// Apply user filters
	const filteredAndSortedPatients = usePatientsFilter(
		patients,
		searchTerm,
		statusFilter,
		ulcerGradeFilter,
		sortBy,
	);

	// Pagination calculations
	const totalPages = Math.ceil(filteredAndSortedPatients.length / patientsPerPage);
	const startIndex = currentPage * patientsPerPage;
	const endIndex = startIndex + patientsPerPage;
	const displayedPatients = filteredAndSortedPatients.slice(startIndex, endIndex);

	// Pagination handlers
	const handleNextPage = () => {
		if (currentPage < totalPages - 1) {
			const newPage = currentPage + 1;
			setCurrentPage(newPage);
			setPageInput(String(newPage + 1));
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 0) {
			const newPage = currentPage - 1;
			setCurrentPage(newPage);
			setPageInput(String(newPage + 1));
		}
	};

	const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (/^\d*$/.test(value)) {
			setPageInput(value);
		}
	};

	const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			goToPage();
		}
	};

	const handlePageInputBlur = () => {
		goToPage();
	};

	const goToPage = () => {
		if (pageInput === '') {
			setPageInput(String(currentPage + 1));
			return;
		}

		const pageNum = parseInt(pageInput, 10);
		if (isNaN(pageNum) || pageNum < 1) {
			setCurrentPage(0);
			setPageInput('1');
		} else if (pageNum > totalPages) {
			setCurrentPage(totalPages - 1);
			setPageInput(String(totalPages));
		} else {
			setCurrentPage(pageNum - 1);
			setPageInput(String(pageNum));
		}
	};

	// Reset page on filter change
	useEffect(() => {
		setCurrentPage(0);
		setPageInput('1');
	}, [searchTerm, statusFilter, ulcerGradeFilter, sortBy]);

	// Sync input when currentPage changes
	useEffect(() => {
		setPageInput(String(currentPage + 1));
	}, [currentPage]);

	return (
		<div className='my-6'>
			{/* Filter Controls */}
			{!filterByScanStatus && (
				<div className='mt-6 flex'>
					<Button
						variant='salmon'
						size='card'
						className='-mt-4 ml-auto rounded-none px-4 py-4 text-lg font-normal'
						onClick={() => {
							console.log('Create New Patient clicked');
						}}
					>
						Create New Patient
						<Plus className='ml-2 h-5 w-5' />
					</Button>
				</div>
			)}

			{!filterByScanStatus && (
				<PatientsTableFilters
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					ulcerGradeFilter={ulcerGradeFilter}
					setUlcerGradeFilter={setUlcerGradeFilter}
					sortBy={sortBy}
					setSortBy={setSortBy}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
				/>
			)}

			{/* Table */}
			<div className='w-full overflow-hidden bg-white-primary shadow-sm'>
				{/* Header */}
				<div
					className='grid grid-cols-[1.5fr,1fr,1fr,1fr,1fr,1fr,1fr,1fr,40px]
                   bg-[#0E5C64] px-4 py-2 text-sm font-semibold text-white-primary'
				>
					<span className='pl-2'>Name</span>
					<span className='text-center'>Age</span>
					<span className='text-center'>Patient ID</span>
					<span className='text-center'>Treatment Start Date</span>
					<span className='text-center'>Last Visit Date</span>
					<span className='text-center'>Next Visit Date</span>
					<span className='text-center'>Ulcer/s Grade</span>
					<span className='text-center'>Status</span>
					<span></span>
				</div>

				{/* Table rows */}
				{displayedPatients.map((p, index) => (
					<div
						key={index}
						className='text-gray-700 border-gray-300 
                       grid grid-cols-[1.5fr,1fr,1fr,1fr,1fr,1fr,1fr,1fr,40px]
                       items-center border-b bg-white-primary px-4 py-3 text-sm transition-colors hover:bg-[#d7f4f7]'
					>
						<div className='flex items-center gap-2 pl-2'>
							{p.flag && (
								<Flag
									size={16}
									className='text-red-500 hover:text-red-600 transition-colors'
									stroke='red'
									fill='red'
								/>
							)}
							<span className='font-medium'>{p.name}</span>
						</div>

						<span className='text-center'>{p.age}</span>
						<span className='text-center font-mono'>{p.id}</span>
						<span className='text-center'>{p.startDate}</span>
						<span className='text-center'>{p.lastVisit}</span>
						<span className='text-center'>{p.nextVisit}</span>
						<span className='text-center font-medium'>{p.ulcerGrade}</span>

						<div className='flex justify-center'>
							<StatusPill status={p.status} />
						</div>

						<div className='flex justify-end'>
							<button className='text-gray-500 hover:text-gray-700'>
								<Eye size={16} />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Pagination */}
			<div className='border-gray-200 relative mt-6 flex items-center justify-between border-t pt-4'>
				<div className='text-gray-600 text-sm'>
					Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedPatients.length)} of{' '}
					{filteredAndSortedPatients.length} patients
				</div>

				<div className='absolute left-1/2 -translate-x-1/2'>
					<div className='flex items-center gap-2'>
						<Button
							variant='pagination'
							size='pagination'
							onClick={handlePrevPage}
							disabled={currentPage === 0}
							direction='left'
						/>

						<div className='flex items-center gap-2'>
							<div className='h-9 w-12'>
								<TextInput
									value={pageInput}
									onChange={handlePageInputChange}
									onKeyDown={handlePageInputSubmit}
									onBlur={handlePageInputBlur}
									className='border-gray-300 bg-white text-gray-700 h-9 w-12 rounded-lg border px-0 text-center text-sm font-medium shadow-sm focus:border-[#0E5C64] focus:outline-none focus:ring-2 focus:ring-[#0E5C64]/20'
									sanitize={false}
									label={undefined}
								/>
							</div>

							<span className='text-gray-500 mx-1 text-sm'>of</span>

							<div className='h-9 w-12'>
								<TextInput
									value={totalPages.toString()}
									readOnly
									className='h-9 w-12 cursor-default rounded-lg border-2 border-[#0E5C64] bg-gradient-to-b from-[#0E5C64]/5 to-[#0E5C64]/10 px-0 text-center text-sm font-bold text-[#0E5C64] shadow-sm disabled:opacity-100'
									sanitize={false}
									label={undefined}
								/>
							</div>
						</div>

						<Button
							variant='pagination'
							size='pagination'
							onClick={handleNextPage}
							disabled={currentPage === totalPages - 1}
							direction='right'
						/>
					</div>
				</div>

				<div className='w-40'></div>
			</div>
		</div>
	);
};

export default PatientsTable;
