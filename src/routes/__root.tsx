import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { Toaster } from 'sonner';

export interface RouterContext {
	pageName: string;
	returnLink: string | undefined;
	isAuthenticated?: boolean;
	token?: string;
	user?: any;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<>
			<Outlet />
			<Toaster richColors />
		</>
	),
});
