import { type FC } from 'react';
import { useRouteContext } from '@tanstack/react-router';
import { User } from '../../../types/UserTypes';
import { updateUser } from '../../../shared/api/services/userService';

type Props = {
	jobRole: User['jobRole'];
};

const RoleInput: FC<Props> = ({ jobRole }) => {
	const context = useRouteContext({ from: '/_protected' })

	return <input
		className='w-52 border border-transparent text-right text-sm hover:cursor-pointer focus:rounded-md focus:border-slate-secondary focus:bg-cloud-primary focus:px-0.5 focus:hover:cursor-auto focus-visible:outline-none'
		placeholder='Add your job role here'
		defaultValue={jobRole}
		onBlur={e => updateUser(context.token!, { jobRole: e.target.value })}
		onKeyDown={e => {
			if (e.key === 'Enter' || e.key === 'Escape') {
				(e.target as HTMLInputElement).blur();
			}
		}}
	/>
	};

export default RoleInput;
