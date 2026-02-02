import { type FC } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { User } from '../../types/UserTypes';
import UserIcon from './components/UserIcon';
import usePageInfo from './hooks/usePageInfo';
import UserInfo from './components/UserInfo';
import MobileSidebar from '../MobileSidebar';

type Props = {
	user: User;
};

const Header: FC<Props> = ({ user }) => {
	const pageInfo = usePageInfo();
	const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
	//console.log('user role', user.jobRole);

	return (
		<div className='flex w-full items-center gap-x-5 border-b-2 border-slate-border bg-white-primary px-5 py-2'>
			<MobileSidebar />
			<div className='flex items-center gap-x-3'>
				{!!pageInfo && pageInfo.returnLink && (
					<Link className='max-md:hidden' to={pageInfo.returnLink}>
						<ChevronLeft />
					</Link>
				)}
				<div className='text-base font-bold sm:text-lg'>{!!pageInfo && pageInfo.pageName}</div>
			</div>

			<div className='ml-auto flex gap-x-2'>
				<UserInfo user={user} />
				<UserIcon initials={initials} />
			</div>
		</div>
	);
};

export default Header;
