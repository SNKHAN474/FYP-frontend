import Input from '../../shared/components/Input';
import PasswordInput from '../../shared/components/PasswordInput';
import { Button } from '../../shared/components/Button';
import useLoginForm from './hooks/useLoginForm';

const LoginForm = () => {
	const { errors, handleSubmit, isSubmitting, register, buttonDisabled } = useLoginForm();
	return (
		<form onSubmit={handleSubmit} className='flex w-full flex-col items-center gap-y-4'>
			<h1 className='w-full text-2xl text-blue-faded'>Sign-in</h1>
			<Input placeholder='Email' error={errors.email?.message} {...register('email')} />
			<PasswordInput
				placeholder='Password'
				error={errors.password?.message}
				{...register('password')}
			/>
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

export default LoginForm;
