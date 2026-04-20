// components/table/TableBody.tsx
import { PatientTableRow } from './patient_types';
import { TableRow } from './TableRow';

interface Props {
	rows: PatientTableRow[];
}

export const TableBody = ({ rows }: Props) => (
	<tbody>
		{rows.map(row => (
			<TableRow key={row.patientId} row={row} />
		))}
	</tbody>
);
