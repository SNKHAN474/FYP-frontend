import { type FC } from 'react';
import { type UseNavigateResult } from '@tanstack/react-router';
import { flexRender, type Row } from '@tanstack/react-table';
import type { PatientWithoutScansAndNotes } from '../../../types/PatientTypes';
import { cn } from '../../../shared/utils/helpers';

type Props = {
	row: Row<PatientWithoutScansAndNotes>;
	navigate: UseNavigateResult<string>;
	lastColumnIndex: number;
};

const Row: FC<Props> = ({ row, lastColumnIndex, navigate }) => (
	<tr
		className='h-20 border-b border-slate-border hover:cursor-pointer hover:bg-[#F5F5F5]'
		onClick={() =>
			navigate({
				to: '/patients/$patientId',
				params: { patientId: row.original.id },
			})
		}
	>
		{row.getVisibleCells().map(cell => (
			<td
				key={cell.id}
				className={cn('max-w-44 truncate p-2', {
					'pl-4': cell.column.getIndex() === 0,
					'pr-4': cell.column.getIndex() === lastColumnIndex,
				})}
			>
				{flexRender(cell.column.columnDef.cell, cell.getContext())}
			</td>
		))}
	</tr>
);

export default Row;
