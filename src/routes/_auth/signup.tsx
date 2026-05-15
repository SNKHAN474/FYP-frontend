import { useState } from 'react';
import { createFileRoute, useNavigate, Navigate, Link } from '@tanstack/react-router';
import { Button } from '../../shared/components/Button';
import TashaLogo from '../../shared/components/TashaLogo';
import AuthLayout from '../../shared/components/TEMP_AuthLayout';
import PasswordInput from '../../shared/components/PasswordInput';
import TextInput from '../../shared/components/TextInput';
import Dropdown from '../../shared/components/Dropdown';

const Signup = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

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

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch('http://localhost:3000/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Registration failed');
			}

			// Store JWT and Header info[cite: 1]
			localStorage.setItem('token', data.token);
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

	const isAuthenticated = !!localStorage.getItem('token');
	if (isAuthenticated) return <Navigate to='/TEMP_table_test' />;

	return (
		<AuthLayout>
			{isLoading ? (
				<div className='flex flex-col items-center gap-4'>
					<TashaLogo />
					<p className='animate-pulse'>Creating your clinical account...</p>
				</div>
			) : (
				<>
					<h1 className='w-full text-center text-2xl font-bold text-blue-faded'>Create Account</h1>

					<form onSubmit={handleSignup} className='flex w-full flex-col gap-y-4'>
						<Dropdown
							label='Title'
							placeholderLabel='Select Title'
							value={formData.title}
							updateValue={value => handleInputChange('title', value)}
							options={titles}
						/>

						<div className='flex gap-4'>
							<div className='flex-1'>
								<TextInput
									label='First Name'
									placeholder='First Name'
									value={formData.firstName}
									onChange={e => handleInputChange('firstName', e.target.value)}
									required
								/>
							</div>
							<div className='flex-1'>
								<TextInput
									label='Last Name'
									placeholder='Last Name'
									value={formData.lastName}
									onChange={e => handleInputChange('lastName', e.target.value)}
									required
								/>
							</div>
						</div>

						<Dropdown
							label='Position'
							placeholderLabel='Select Position'
							value={formData.position}
							updateValue={value => handleInputChange('position', value)}
							options={positions}
						/>

						<TextInput
							label='Email'
							placeholder='Email'
							value={formData.email}
							onChange={e => handleInputChange('email', e.target.value)}
							required
						/>

						<PasswordInput
							label='Password'
							placeholder='Password'
							value={formData.password}
							onChange={e => handleInputChange('password', e.target.value)}
							required
						/>

						{error && <p className='text-red-500 text-center text-sm font-bold'>{error}</p>}

						<Button variant='salmon' size='auth' type='submit'>
							Sign Up
						</Button>
					</form>

					<div className='login-page-link text-center'>
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
