import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../utils/helpers';

type Props = InputHTMLAttributes<HTMLInputElement> & {
	error?: string;
	label?: string;
	unit?: string;
	unitSide?: 'left' | 'right';
	className?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
	({ error, label, unit, unitSide = 'right', className, ...rest }, ref) => {
		const randomKey = useId();

		return (
			<div className='w-full space-y-0.5'>
				{label && (
					<label className='text-sm' htmlFor={randomKey}>
						{label}
					</label>
				)}
				<div className='relative w-full'>
					<input
						id={randomKey}
						className={cn(
							'flex h-10 w-full rounded-xl border bg-cloud-primary px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-secondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
							className,
							{
								'border-red-primary': error,
								'focus-visible:border-ring border-slate-border focus:border-slate-secondary':
									!error,
							},
						)}
						ref={ref}
						{...rest}
					/>
					{unit && (
						<div
							className={cn('pointer-events-none absolute inset-y-0 my-auto h-fit text-sm', {
								'left-3': unitSide === 'left',
								'right-3': unitSide === 'right',
							})}
						>
							{unit}
						</div>
					)}
				</div>
				{error ? <p className='h-5 text-sm text-red-primary'>{error}</p> : <div className='h-5' />}
			</div>
		);
	},
);

export default Input;
