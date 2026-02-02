// /routes/_protected.tsx
import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';
import Sidebar from '../module/Sidebar';
import auth0Details from '../utils/auth0_details';
import { User } from '../types/UserTypes';

const ProtectedRoot = () => {
	const { user, isAuthenticated } = Route.useLoaderData();

	return isAuthenticated ? (
		<div className='flex h-full'>
			<Sidebar />
			<div className='flex w-full flex-col overflow-x-auto'>
				{/* REMOVED: <Header user={user} /> */}
				<div className='flex grow flex-col overflow-y-auto bg-cloud-primary'>
					<div className='mx-auto w-full max-w-screen-xl grow px-4 py-8'>
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	) : (
		<Navigate to='/login' />
	);
};

export const Route = createFileRoute('/_protected')({
	component: ProtectedRoot,
	loader: async ({ context }) => {
		if (!!context.token) {
			const user = context.user;
			const nameObj = auth0Details().audience + '/name';
			const jobRole = auth0Details().audience + '/job_role';

			return {
				user: {
					firstName: user?.[nameObj].givenName,
					lastName: user?.[nameObj].familyName,
					email: user?.email,
					jobRole: user?.[jobRole],
				} as User,
				isAuthenticated: context.isAuthenticated,
				token: context.token,
			};
		} else {
			return {
				user: null,
			};
		}
	},
});
