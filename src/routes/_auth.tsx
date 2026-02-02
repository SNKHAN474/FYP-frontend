import { Outlet, createFileRoute } from '@tanstack/react-router';

const AuthRoot = () => (
			<>
				<Outlet />
			</>
);

export const Route = createFileRoute('/_auth')({
	component: AuthRoot,
});
