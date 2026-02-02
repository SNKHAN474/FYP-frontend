import Input from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import useForgotPasswordForm from './hooks/useForgotPasswordForm';

const ForgotPasswordForm = () => {
	const { errors, handleSubmit, isSubmitting, register, buttonDisabled } = useForgotPasswordForm();
	return (
		<form onSubmit={handleSubmit} className='flex w-full flex-col items-center gap-y-4'>
			<h1 className='text-blue-faded w-full text-2xl flex justify-center'>Forgot Password</h1>
			<p className='w-full'>Please enter your email address to reset your password</p>
			<Input placeholder='Email' error={errors.email?.message} {...register('email')} />
			<Button
				type='submit'
				size='auth'
				className='w-fit'
				isSubmitting={isSubmitting}
				disabled={buttonDisabled}
			>
				Confirm
			</Button>
		</form>
	);
};

export default ForgotPasswordForm;
