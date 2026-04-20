import { useNavigate } from '@tanstack/react-router';
import { TABLE_GRID } from './TableColumns';
import { Eye } from 'lucide-react';
import { PatientTableRow } from './patient_types';
import StatusPill from '../StatusPill';
import { mapStatusToPill } from '../../utils/mapStatusToPill';

interface Props {
	row: PatientTableRow;
}

export const TableRow = ({ row }: Props) => {
	const navigate = useNavigate();
	const pillStatus = mapStatusToPill(row.status);

	const handleClick = () => {
		navigate({
			to: '/patients/$patientId',
			params: {
				patientId: row.id,
			},
		});
	};

	return (
		<div
			onClick={handleClick}
			className={`${TABLE_GRID} cursor-pointer items-center border-b bg-white-primary px-4 py-2 text-sm transition-colors hover:bg-[#d7f4f7]`}
		>
			<div>{row.name}</div>
			<div>{row.age}</div>
			<div>{row.patientId}</div>
			<div>{row.treatmentStartDate}</div>
			<div>{row.lastVisitDate}</div>
			<div>{row.nextVisitDate}</div>
			<div>{row.ulcerGrade}</div>

			<div>
				<StatusPill status={pillStatus} />
			</div>

			<div className='flex justify-center'>
				<Eye className='text-gray-600 hover:text-gray-900 h-4 w-4' />
			</div>
		</div>
	);
};
