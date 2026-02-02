import { createFileRoute } from '@tanstack/react-router';
import ResetPasswordForm from '../../module/ResetPasswordForm';
import AuthLayout from '../../shared/components/TEMP_AuthLayout';

const ResetPassword = () => {
	return (
		<AuthLayout>
			<ResetPasswordForm />
		</AuthLayout>
	);
};

export const Route = createFileRoute('/_auth/reset-password')({
	component: ResetPassword,
});
