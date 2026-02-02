import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './App.css';
import { queryClient } from '../shared/utils/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import Auth0ProviderWithHistory from '../auth/Auth0-provider-with-history';
import { useAuth0 } from '@auth0/auth0-react';
import { useToken } from '../hooks/useToken';
import TashaLogo from '../shared/components/TashaLogo';

const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
	context: { pageName: '', returnLink: '', isAuthenticated: false, token: '' },
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const InnerApp = () => {
	const { isLoading, isAuthenticated, user } = useAuth0();
	const { isTokenLoading, token }= useToken();
	//setTimeout(() => console.log("Sleep for 5 seconds", isAuthenticated), 5000);

	/*
	useEffect(() => {
		//setTimeout(() => console.log('InnerApp isAuthenticated', isAuthenticated), 5000);
		//console.log('InnerApp isAuthenticated', isAuthenticated)
		console.log('InnerApp token', token)

	}, [token]);
	*/
	
	
	//console.log('InnerApp isAuthenticated', isAuthenticated);
	return isAuthenticated && !!token ? (
		<RouterProvider router={router} context={{pageName: '', returnLink: '', isAuthenticated: isAuthenticated, token, user }} />
	  ) : 
		  isLoading || isTokenLoading ? (
			<div className='flex h-full min-h-screen items-center justify-center bg-cloud-primary'>
				<div className='flex w-full max-w-[625px] flex-col items-center justify-center gap-y-8 border border-slate-border bg-white-primary p-4 max-sm:min-h-screen sm:p-[90px]'>
						<TashaLogo />
						<p>Loading...</p>
				</div>
			</div>
		  ) : (
			<RouterProvider router={router} context={{pageName: '', returnLink: '', isAuthenticated: isAuthenticated, token }} />
		  )
		
	 
  }

  createRoot(document.getElementById('root')!).render(
	  <QueryClientProvider client={queryClient}>
		<Auth0ProviderWithHistory>
				<InnerApp />
		</Auth0ProviderWithHistory>
	  </QueryClientProvider>
  );
