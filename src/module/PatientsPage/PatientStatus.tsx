import { FC } from 'react';
import { cn } from '../../shared/utils/helpers';
import { Patient } from '../../types/PatientTypes';

type Props = {
	status: Patient['status'];
};

const PatientStatus: FC<Props> = ({ status }) => (
	<div className='flex items-center gap-x-2 text-sm text-slate-secondary'>
		<div
			className={cn('size-[14px] rounded-full', {
				'bg-green-primary': status === 'ACTIVE',
				'bg-blue-primary': status === 'NEW',
				'bg-yellow-primary': status === 'INACTIVE',
				'bg-orange-primary': status === 'Missing scans',
				'bg-red-primary': status === 'Flagged',
			})}
		/>
		{status}
	</div>
);

export default PatientStatus;
