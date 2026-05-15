import { useState } from 'react';
import { createFileRoute, useNavigate, Link, Navigate } from '@tanstack/react-router';
import { Button } from '../../shared/components/Button';
import TashaLogo from '../../shared/components/TashaLogo';
import AuthLayout from '../../shared/components/TEMP_AuthLayout';
import PasswordInput from '../../shared/components/PasswordInput';
import TextInput from '../../shared/components/TextInput';

// ── auth helpers ────────────────────────────────────────────────────────────
// Tokens now live in httpOnly cookies set by the server — the browser sends
// them automatically. We only store non-sensitive display info in localStorage.

export const fetchWithRefresh = async (
	url: string,
	options: RequestInit = {},
): Promise<Response> => {
	// always include cookies
	const res = await fetch(url, { ...options, credentials: 'include' });

	if (res.status === 401) {
		// access token has expired — try a silent refresh
		const refreshRes = await fetch('http://localhost:3000/auth/refresh', {
			method: 'POST',
			credentials: 'include',
		});

		if (refreshRes.ok) {
			// retry the original request with the new access token cookie
			return fetch(url, { ...options, credentials: 'include' });
		} else {
			// refresh token is also expired — clear display data and redirect
			localStorage.clear();
			window.location.href = '/login';
		}
	}

	return res;
};

export const isAuthenticated = (): boolean => {
	// We can't read httpOnly cookies from JS — use a lightweight presence
	// check on the display-only data we stored at login instead.
	return !!localStorage.getItem('userName');
};

// ── component ───────────────────────────────────────────────────────────────

const Login = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch('http://localhost:3000/auth/login', {
				method: 'POST',
				credentials: 'include', // receive httpOnly cookies from server
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Login failed');
			}

			// tokens are now in httpOnly cookies — only store display info
			localStorage.setItem('userName', `${data.staff.firstName} ${data.staff.lastName}`);
			localStorage.setItem('userPosition', data.staff.position);
			if (data.staff?.clinicianId) {
				localStorage.setItem('clinicianId', data.staff.clinicianId);
			}

			navigate({ to: '/TEMP_table_test' });
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (isAuthenticated()) return <Navigate to='/TEMP_table_test' />;

	return (
		<AuthLayout>
			{isLoading ? (
				<div className='flex flex-col items-center gap-4'>
					<TashaLogo />
					<p className='animate-pulse'>Authenticating...</p>
				</div>
			) : (
				<>
					<form onSubmit={handleLogin} className='flex w-full flex-col gap-y-4'>
						<TextInput
							label='Email'
							placeholder='Email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
						/>

						<div className='-mt-5'>
							<PasswordInput
								label='Password'
								placeholder='Password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
							/>
						</div>

						{error && <p className='text-red-500 text-center text-sm font-bold'>{error}</p>}

						<div className='login-page-link -mt-10 w-full text-right'>
							<Link
								to='/forgot-password'
								style={{ textDecoration: 'none' }}
								className='font-extrabold text-[#34ACBE] hover:underline'
							>
								Forgot Password
							</Link>
						</div>

						<Button variant='salmon' size='auth' type='submit'>
							Login
						</Button>
					</form>

					<div className='login-page-link text-center'>
						Don't have an account?{' '}
						<Link to='/signup' className='font-extrabold text-[#34ACBE] hover:underline'>
							Sign Up
						</Link>
					</div>
				</>
			)}
		</AuthLayout>
	);
};

export const Route = createFileRoute('/_auth/login')({
	component: Login,
});
