import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../utils/helpers';

type Props = InputHTMLAttributes<HTMLInputElement> & {
	error?: string;
	label?: string;
	sanitize?: boolean;
};

const TextInput = forwardRef<HTMLInputElement, Props>(
	({ error, label, sanitize = true, onChange, ...rest }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (sanitize) {
				// Basic sanitization - remove common SQL injection patterns
				let value = e.target.value;

				// Basic SQL injection pattern detection (for validation, not strict blocking)
				const sqlPatterns = [
					/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/gi,
					/(;|--|#|\/\*|\*\/)/g,
				];

				sqlPatterns.forEach(pattern => {
					value = value.replace(pattern, '');
				});

				// Create a new event with sanitized value
				const sanitizedEvent = {
					...e,
					target: {
						...e.target,
						value,
					},
				};

				onChange?.(sanitizedEvent as React.ChangeEvent<HTMLInputElement>);
			} else {
				onChange?.(e);
			}
		};

		return (
			<div className='w-full space-y-0.5'>
				{label && <label className='text-sm'>{label}</label>}
				<input
					ref={ref}
					{...rest}
					onChange={handleChange}
					className={cn(
						'flex h-10 w-full rounded-xl border bg-cloud-primary px-3 py-2 text-sm placeholder:text-slate-secondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
						{
							'border-red-primary': error,
							'focus-visible:border-ring border-slate-border focus:border-slate-secondary': !error,
						},
					)}
				/>
				{error ? <p className='h-5 text-sm text-red-primary'>{error}</p> : <div className='h-5' />}
			</div>
		);
	},
);

export default TextInput;
