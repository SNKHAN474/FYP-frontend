import { Link, createFileRoute } from '@tanstack/react-router';
import ForgotPasswordForm from '../../module/ForgotPasswordForm';
import AuthLayout from '../../shared/components/TEMP_AuthLayout';

/*const ForgotPassword = () => (
	<>
		<ForgotPasswordForm />
		<Link className='text-sm' to='/login'>
			Back to Sign In
		</Link>
	</>
);*/

const ForgotPassword = () => {
	return (
		<AuthLayout>
			<>
				<ForgotPasswordForm />
					<div className='link-to-login'>
						Back to{' '} <Link className='font-extrabold text-[#34ACBE] hover:underline' to='/login'>Sign In</Link>
					</div>
			</>
		</AuthLayout>
	)
}

export const Route = createFileRoute('/_auth/forgot-password')({
	component: ForgotPassword,
});
