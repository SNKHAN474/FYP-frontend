import { useState, useEffect } from 'react';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { PatientTableRow } from './patient_types';
import { Pagination } from './Pagination';
import { TABLE_GRID } from './TableColumns';
import { Eye } from 'lucide-react';
import StatusPill from '../StatusPill';

interface Props {
	data: PatientTableRow[];
	clinicianId: string; // Added the clinicianId prop
}

export const PatientTable = ({ data, clinicianId }: Props) => {
	const [currentPage, setCurrentPage] = useState(0);
	const rowsPerPage = 10;

	// STEP 1: Filter data exactly for this clinician before doing anything else
	const filteredData = data.filter(patient => {
		// We check both casing possibilities just in case the mapper changed[cite: 3, 4]
		return (
			(patient as any).ClinicianId === clinicianId || (patient as any).clinicianId === clinicianId
		);
	});

	// STEP 2: Reset page when the filtered results change[cite: 4]
	useEffect(() => {
		setCurrentPage(0);
	}, [filteredData.length]);

	// STEP 3: Use filteredData for all pagination calculations[cite: 4]
	const totalPages = Math.ceil(filteredData.length / rowsPerPage);
	const startIndex = currentPage * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const currentRows = filteredData.slice(startIndex, endIndex);

	const emptyRowsCount = rowsPerPage - currentRows.length;

	return (
		<div className='flex w-full flex-col gap-2 overflow-hidden rounded-lg bg-[#f5feff] p-4 shadow-sm'>
			<div className='bg-white/50 overflow-x-auto rounded-md shadow-inner'>
				<TableHeader />

				<div className='flex flex-col'>
					{/* Render actual data from the filtered list[cite: 4] */}
					{currentRows.map(row => (
						<TableRow key={row.patientId} row={row} />
					))}

					{/* Render empty rows to fill the gap - EXACTLY as you had it[cite: 4] */}
					{emptyRowsCount > 0 &&
						Array.from({ length: emptyRowsCount }).map((_, index) => (
							<div
								key={`empty-${index}`}
								className={`${TABLE_GRID} items-center border-b bg-white-primary px-4 py-2 text-sm`}
							>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>

								{/* Invisible Status Pill to lock in the height[cite: 4] */}
								<div className='invisible'>
									<StatusPill status='New' />
								</div>

								{/* Invisible Eye Icon to match height and spacing[cite: 4] */}
								<div className='flex justify-center'>
									<Eye className='pointer-events-none invisible h-4 w-4 select-none' />
								</div>
							</div>
						))}

					{/* Show "No patients" based on filtered results[cite: 4] */}
					{filteredData.length === 0 && (
						<div className='text-gray-500 bg-white py-10 text-center'>
							No patients found for clinician: <strong>{clinicianId}</strong>
						</div>
					)}
				</div>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				totalItems={filteredData.length}
				rowsPerPage={rowsPerPage}
				onPageChange={setCurrentPage}
			/>
		</div>
	);
};
