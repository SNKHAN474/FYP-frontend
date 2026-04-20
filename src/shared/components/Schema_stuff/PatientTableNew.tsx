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
}

export const PatientTable = ({ data }: Props) => {
	const [currentPage, setCurrentPage] = useState(0);
	const rowsPerPage = 10;

	useEffect(() => {
		setCurrentPage(0);
	}, [data.length]);

	const totalPages = Math.ceil(data.length / rowsPerPage);
	const startIndex = currentPage * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const currentRows = data.slice(startIndex, endIndex);

	const emptyRowsCount = rowsPerPage - currentRows.length;

	return (
		<div className='flex w-full flex-col gap-2 overflow-hidden rounded-lg bg-[#f5feff] p-4 shadow-sm'>
			<div className='bg-white/50 overflow-x-auto rounded-md shadow-inner'>
				<TableHeader />

				<div className='flex flex-col'>
					{/* Render actual data */}
					{currentRows.map(row => (
						<TableRow key={row.patientId} row={row} />
					))}

					{/* Render empty rows to fill the gap */}
					{emptyRowsCount > 0 &&
						Array.from({ length: emptyRowsCount }).map((_, index) => (
							<div
								key={`empty-${index}`}
								// We use exact same padding (py-2) and grid as TableRow
								className={`${TABLE_GRID} items-center border-b bg-white-primary px-4 py-2 text-sm`}
							>
								{/* Fill empty text columns to match TableRow structure */}
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>
								<div>&nbsp;</div>

								{/* Invisible Status Pill to lock in the height */}
								<div className='invisible'>
									<StatusPill status='New' />
								</div>

								{/* Invisible Eye Icon to match height and spacing */}
								<div className='flex justify-center'>
									<Eye className='pointer-events-none invisible h-4 w-4 select-none' />
								</div>
							</div>
						))}

					{/* Show "No patients" only if data is empty */}
					{data.length === 0 && (
						<div className='text-gray-500 bg-white py-10 text-center'>No patients found.</div>
					)}
				</div>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				totalItems={data.length}
				rowsPerPage={rowsPerPage}
				onPageChange={setCurrentPage}
			/>
		</div>
	);
};
