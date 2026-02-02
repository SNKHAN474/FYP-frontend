import { Link } from '@tanstack/react-router';
import { buttonVariants } from '../../shared/components/Button';
import { FC } from 'react';
import { cn } from '../../shared/utils/helpers';
import { Patient } from '../../types/PatientTypes';

type Props = {
	id: Patient['id'];
	card?: boolean;
};

const PatientLinkEdit: FC<Props> = ({ id, card = false }) => (
	<Link
		to='/patients'
		className={cn(
			buttonVariants({
				variant: 'green',
				size: card ? 'card' : 'default',
			}),
			{ 'w-full': card, 'float-right': !card },
		)}
		onClick={e => e.stopPropagation()}
		search={() => ({ mode: 'Edit' as const, patientId: id })}
		preload={false}
	>
		Edit
	</Link>
);

export default PatientLinkEdit;
