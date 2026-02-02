import { type FC } from 'react';
import { Link } from '@tanstack/react-router';
import type { NavLink } from '../../../types/NavigationTypes';

type Props = NavLink & { handleClose?: () => void };

const NavLink: FC<Props> = props => {
	const { to, label, icon: Icon, handleClose } = props;
	return (
		<Link
			to={to}
			className='flex h-10 w-52 items-center gap-x-1.5 rounded-2xl px-5 text-base'
			inactiveProps={{ className: 'hover:bg-slate-faded' }}
			activeProps={{ className: 'bg-blue-primary text-cloud-primary' }}
			onClick={handleClose}
		>
			<Icon size={17} />
			{label}
		</Link>
	);
};

export default NavLink;
