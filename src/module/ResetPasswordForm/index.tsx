import { Button } from '../../shared/components/Button';
import useResetPasswordForm from './hooks/useResetPasswordForm';
import PasswordInput from '../../shared/components/PasswordInput';

const ResetPasswordForm = () => {
	const { errors, handleSubmit, isSubmitting, register, buttonDisabled } = useResetPasswordForm();
	return (
		<form onSubmit={handleSubmit} className='flex w-full flex-col items-center gap-y-4'>
			<h1 className='text-blue-faded w-full text-2xl flex justify-center'>Reset Password</h1>
			<PasswordInput placeholder='Password' error={errors.password?.message} {...register('password')}/>
			
			<PasswordInput placeholder='Confirm password' error={errors.confirmPassword?.message} {...register('confirmPassword')}/>

			<Button type='submit' size='auth' className='w-fit' isSubmitting={isSubmitting} disabled={buttonDisabled}>Confirm</Button>
		</form>
	);
};

export default ResetPasswordForm;
