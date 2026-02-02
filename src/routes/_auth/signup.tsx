import { useState } from 'react';
import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../../shared/components/Button';
import TashaLogo from '../../shared/components/TashaLogo';
import AuthLayout from '../../shared/components/TEMP_AuthLayout';
import PasswordInput from '../../shared/components/PasswordInput';
import TextInput from '../../shared/components/TextInput';
import Dropdown from '../../shared/components/Dropdown';

const Signup = () => {
	const { loginWithRedirect, isLoading, isAuthenticated, user } = useAuth0();
	const [formData, setFormData] = useState({
		title: '',
		firstName: '',
		lastName: '',
		position: '',
		email: '',
		password: '',
	});

	const positions = [
		{ label: 'Doctor', value: 'doctor' },
		{ label: 'Nurse', value: 'nurse' },
		{ label: 'Administrator', value: 'administrator' },
		{ label: 'Therapist', value: 'therapist' },
		{ label: 'Other Medical Staff', value: 'other' },
	];

	const titles = [
		{ label: 'Dr', value: 'dr' },
		{ label: 'Mr', value: 'mr' },
		{ label: 'Ms', value: 'ms' },
		{ label: 'Mrs', value: 'mrs' },
		{ label: 'Prof', value: 'prof' },
	];

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const signup = async () => {
		if (!isLoading && !user) {
			await loginWithRedirect({
				authorizationParams: {
					screen_hint: 'signup',
				},
			});
		}
	};

	if (isAuthenticated) return <Navigate to='/patients' />;

	return (
		<AuthLayout>
			{isLoading ? (
				<>
					<TashaLogo />
					<p>Loading...</p>
				</>
			) : (
				<>
					<h1 className='w-full text-center text-2xl text-blue-faded'>Create Account</h1>

					<div className='flex w-full flex-col gap-y-4'>
						{/* Title Dropdown */}
						<Dropdown
							label='Title'
							placeholderLabel='Select Title'
							value={formData.title}
							updateValue={value => handleInputChange('title', value)}
							options={titles}
						/>
						{/* Name Fields */}
						<div className='flex gap-4'>
							<div className='flex-1'>
								<TextInput
									label='First Name'
									placeholder='First Name'
									value={formData.firstName}
									onChange={e => handleInputChange('firstName', e.target.value)}
								/>
							</div>
							<div className='flex-1'>
								<TextInput
									label='Last Name'
									placeholder='Last Name'
									value={formData.lastName}
									onChange={e => handleInputChange('lastName', e.target.value)}
								/>
							</div>
						</div>
						{/* Position Dropdown */}
						<Dropdown
							label='Position'
							placeholderLabel='Select Position'
							value={formData.position}
							updateValue={value => handleInputChange('position', value)}
							options={positions}
						/>
						{/* Email */}
						<TextInput
							label='Email'
							placeholder='Email'
							value={formData.email}
							onChange={e => handleInputChange('email', e.target.value)}
						/>
						{/* Password with requirements */}
						<PasswordInput
							label='Password'
							placeholder='Password'
							value={formData.password}
							onChange={e => handleInputChange('password', e.target.value)}
						/>
						{/* Password requirements - only show when password has content */}
						{formData.password && (
							<div className='text-gray-600 -mt-6 text-xs'>
								<p>Password must contain:</p>
								<ul className='ml-2 list-inside list-disc'>
									<li
										className={
											formData.password.length >= 8 ? 'text-green-primary' : 'text-red-primary'
										}
									>
										Minimum 8 characters
									</li>
									<li
										className={
											/[!@#$%^&*]/.test(formData.password)
												? 'text-green-primary'
												: 'text-red-primary'
										}
									>
										At least one symbol (!@#$%^&*)
									</li>
									<li
										className={
											/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)
												? 'text-green-primary'
												: 'text-red-primary'
										}
									>
										Letters and numbers
									</li>
									<li
										className={
											/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)
												? 'text-green-primary'
												: 'text-red-primary'
										}
									>
										Upper and lowercase letters
									</li>
								</ul>
							</div>
						)}
					</div>

					<Button variant='salmon' size='auth' onClick={signup}>
						Sign Up
					</Button>

					<div className='login-page-link'>
						Already have an account?{' '}
						<Link to='/login' className='font-extrabold text-[#34ACBE] hover:underline'>
							Login
						</Link>
					</div>
				</>
			)}
		</AuthLayout>
	);
};

export const Route = createFileRoute('/_auth/signup')({
	component: Signup,
});
