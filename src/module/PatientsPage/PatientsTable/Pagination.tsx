import { type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../shared/utils/helpers';
import { type Table } from '@tanstack/react-table';
import type { PatientWithoutScansAndNotes } from '../../../types/PatientTypes';

type Props = {
	startingPatientNumber: number;
	endingPatientNumber: number;
	totalNumberOfPatients: number;
	pageOptions: string[];
	currentPageIndex: number;
	table: Table<PatientWithoutScansAndNotes>;
};

const Pagination: FC<Props> = props => {
	const {
		endingPatientNumber,
		startingPatientNumber,
		totalNumberOfPatients,
		pageOptions,
		currentPageIndex,
		table,
	} = props;

	return (
		<div className='flex items-center justify-between'>
			<div className='flex gap-x-1'>
				<div className='text-slate-primary'>
					{startingPatientNumber}-{endingPatientNumber}
				</div>
				<div className='text-slate-secondary'>of</div>
				<div className='text-slate-primary'>{totalNumberOfPatients}</div>
				<div className='text-slate-secondary'>patients</div>
			</div>
			<div className='flex gap-x-4'>
				<button
					className='rounded-sm border border-slate-border bg-white-primary disabled:opacity-50'
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft size={20} />
				</button>
				{pageOptions.map(option => {
					const onlyNumberRegex = /\d+/;
					const pageNumber = Number(option.match(onlyNumberRegex));
					const isActivePage = pageNumber - 1 === currentPageIndex;

					return (
						<button
							key={`page-label-${pageNumber}`}
							className={cn('text-slate-secondary', {
								'font-bold text-slate-primary': isActivePage,
							})}
							disabled={isActivePage}
							onClick={() => table.setPageIndex(pageNumber - 1)}
						>
							{option}
						</button>
					);
				})}
				<button
					className='rounded-sm border border-slate-border bg-white-primary disabled:opacity-50'
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRight size={20} />
				</button>
			</div>
		</div>
	);
};

export default Pagination;
