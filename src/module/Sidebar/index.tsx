import { type FC } from 'react';
import { LogOut, X } from 'lucide-react';
import NavLink from './components/NavLink';
import { cn } from '../../shared/utils/helpers';
import { useAuth0 } from '@auth0/auth0-react';
import { NAV_LINKS } from '../../shared/utils/constants';
import TashaLogo from '../../shared/components/TashaLogo';

type Props = {
	mobile?: boolean;
	handleClose?: () => void;
};

const Sidebar: FC<Props> = ({ mobile = false, handleClose }) => {
	const { logout } = useAuth0();

	return <nav
		className={cn(
			'w-fit flex-none flex-col items-center gap-y-8 overflow-x-hidden overscroll-y-auto bg-white-primary px-8 py-6',
			{
				'fixed inset-0 flex duration-300 animate-in slide-in-from-left-full md:hidden': mobile,
				'hidden border-r-2 border-slate-border md:flex': !mobile,
			},
		)}
	>
		{mobile && (
			<button type='button' onClick={handleClose} className='absolute left-5 top-5'>
				<X size={20} />
			</button>
		)}
		<TashaLogo />
		<div className='flex flex-col gap-y-4'>
			{NAV_LINKS.map(link => (
				<NavLink key={`navlink-${link.label}`} handleClose={handleClose} {...link} />
			))}
		</div>
		<button type='button' onClick={() => logout({ returnTo: `${window.location.origin}/login` })} className='mt-auto flex items-center gap-x-1.5'>
			<LogOut size={17} />
			Sign Out
		</button>
	</nav>
};

export default Sidebar;
