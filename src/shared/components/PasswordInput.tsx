import { useState, type InputHTMLAttributes, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/helpers';

type Props = InputHTMLAttributes<HTMLInputElement> & {
	error?: string;
	label?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, Props>(({ error, label, ...rest }, ref) => {
	const [showPassword, setShowPassword] = useState(false);

	const toggleShowPassword = () => setShowPassword(prev => !prev);

	return (
		<div className='w-full space-y-0.5'>
			{label && <label className='text-sm'>{label}</label>}
			<div className='relative w-full'>
				<input
					type={showPassword ? 'text' : 'password'}
					className={cn(
						'flex h-10 w-full rounded-xl border bg-cloud-primary px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-secondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
						{
							'border-red-primary': error,
							'focus-visible:border-ring border-slate-border focus:border-slate-secondary': !error,
						},
					)}
					ref={ref}
					{...rest}
				/>
				<button
					type='button'
					className='absolute inset-y-0 right-2 my-auto h-fit'
					onClick={toggleShowPassword}
				>
					{showPassword ? <Eye /> : <EyeOff />}
				</button>
			</div>
			{error ? <p className='h-5 text-sm text-red-primary'>{error}</p> : <div className='h-5' />}
		</div>
	);
});

export default PasswordInput;
