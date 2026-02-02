import { useMemo, type FC } from 'react';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import PatientStatus from '../PatientStatus';
import type { PatientWithoutScansAndNotes } from '../../../types/PatientTypes';
import { formatDate } from '../../../shared/utils/helpers';
import Pagination from './Pagination';
import useTable from './hooks/useTable';
import HeaderRow from './HeaderRow';
import Row from './Row';
import PatientLinkEdit from '../PatientLinkEdit';

type Props = {
	patients: PatientWithoutScansAndNotes[];
};

const getDateValue = (dateTime: string) => {
	return dateTime.substring(0,10);
}

const PatientsTable: FC<Props> = ({ patients }) => {
	console.log("Patients Data table", patients.length);
	const columnHelper = createColumnHelper<PatientWithoutScansAndNotes>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const columns = useMemo<ColumnDef<PatientWithoutScansAndNotes, any>[]>(
		() => [
			columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
				header: 'NAME',
				cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
			}),
			columnHelper.accessor('sequenceNumber', {
				header: '#ID',
				cell: ({ getValue }) => <span className='text-sm text-slate-secondary'>{getValue()}</span>,
				size: 128,
			}),
			columnHelper.accessor('treatmentStartDate', {
				header: 'TREATMENT START DATE',
				cell: ({ getValue }) => (
					<span className='text-sm text-slate-secondary'>{getDateValue(formatDate(getValue()))}</span>
				),
				size: 20,
			}),
			columnHelper.accessor('nextVisitDate', {
				header: 'NEXT VISIT DATE',
				cell: ({ getValue }) => (
					<span className='text-sm text-slate-secondary'>{getDateValue(formatDate(getValue()))}</span>
				),
				size: 64,
			}),
			columnHelper.accessor('lastVisitDate', {
				header: 'LAST VISIT DATE',
				cell: ({ getValue }) => (
					<span className='text-sm text-slate-secondary'>{getDateValue(formatDate(getValue()))}</span>
				),
				size: 64,
			}),
			columnHelper.accessor('status', {
				header: 'STATUS',
				cell: ({ getValue }) => <PatientStatus status={getValue()} />,
				size: 112,
			}),
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) => <PatientLinkEdit id={row.original.id} />,
				size: 96,
			}),
		],
		[],
	);

	const { navigate, table, ...paginationData } = useTable(patients, columns);

	return (
		<div className='flex h-full w-full flex-col justify-between gap-y-6 overflow-x-auto'>
			<table className='w-full border-collapse text-left'>
				<thead className='h-10 text-xs text-slate-secondary'>
					{table.getHeaderGroups().map(headerGroup => (
						<HeaderRow
							key={`header-row-${headerGroup.id}`}
							headerGroup={headerGroup}
							lastColumnIndex={columns.length - 1}
						/>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map(row => (
						<Row
							key={`row-${row.id}`}
							row={row}
							navigate={navigate}
							lastColumnIndex={columns.length - 1}
						/>
					))}
				</tbody>
			</table>
			<Pagination table={table} {...paginationData} />
		</div>
	);
};

export default PatientsTable;
