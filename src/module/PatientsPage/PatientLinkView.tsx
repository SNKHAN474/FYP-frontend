import { Link } from '@tanstack/react-router';
import { buttonVariants } from '../../shared/components/Button';
import { FC } from 'react';
import { Patient } from '../../types/PatientTypes';
import { cn } from '../../shared/utils/helpers';

type Props = {
	id: Patient['id'];
};

const PatientLinkView: FC<Props> = ({ id }) => (
	<Link
		to='/patients/$patientId'
		className={cn(
			buttonVariants({
				variant: 'default',
				size: 'card',
			}),
			'w-full',
		)}
		params={{ patientId: id }}
	>
		View
	</Link>
);

export default PatientLinkView;
