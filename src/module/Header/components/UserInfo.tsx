import { type FC } from 'react';
import { User } from '../../../types/UserTypes';
import RoleInput from './RoleInput';

type Props = {
	user: User;
};

const UserInfo: FC<Props> = ({ user }) => (
	<div className='hidden flex-col justify-center gap-y-0.5 text-right sm:flex'>
		<div className='mt-1 text-lg font-semibold leading-[18px]'>
			{user.firstName + ' ' + user.lastName}
		</div>
		<RoleInput jobRole={user.jobRole} />
	</div>
);

export default UserInfo;
