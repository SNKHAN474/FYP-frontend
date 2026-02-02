import { type FC } from 'react';

type Props = {
	initials: string;
};

const UserIcon: FC<Props> = ({ initials }) => (
	<div className='pointer-events-none flex size-12 touch-none select-none items-center justify-center rounded-full border-2 border-slate-secondary text-center text-lg font-bold'>
		{initials}
	</div>
);

export default UserIcon;
