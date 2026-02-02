import { useState } from 'react';
import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../../shared/components/Button';
import TashaLogo from '../../shared/components/TashaLogo';
import AuthLayout from '../../shared/components/TEMP_AuthLayout';
import PasswordInput from '../../shared/components/PasswordInput';
import TextInput from '../../shared/components/TextInput';

const Login = () => {
	const { loginWithRedirect, isLoading, isAuthenticated, user } = useAuth0();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const login = async () => {
		if (!isLoading && !user) {
			// If using Auth0, you might pass additional parameters if needed
			await loginWithRedirect();
		}
	};

	if (isAuthenticated) return <Navigate to='/TEMP_toggle_test' />;

	return (
		<AuthLayout>
			{isLoading ? (
				<>
					<TashaLogo />
					<p>Loading...</p>
				</>
			) : (
				<>
					<div className='flex w-full flex-col gap-y-4'>
						{/* Email */}
						<TextInput
							label='Email'
							placeholder='Email'
							value={email}
							onChange={e => setEmail(e.target.value)}
						/>

						{/* Password */}
						<div className='-mt-5'>
							<PasswordInput
								label='Password'
								placeholder='Password'
								value={password}
								onChange={e => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className='login-page-link -mt-12 w-full text-right'>
						{/* Forgot Password */}
						<Link to='/forgot-password' className='font-extrabold text-[#34ACBE] hover:underline'>
							Forgot Password
						</Link>
					</div>

					{/* Login */}
					<Button variant='salmon' size='auth' onClick={login}>
						Login
					</Button>

					<div className='login-page-link'>
						Don't have an account? {/* Signup */}
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
