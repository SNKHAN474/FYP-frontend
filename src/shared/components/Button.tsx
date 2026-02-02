import { type ButtonHTMLAttributes, type FC } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/helpers';

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-blue-primary text-white-primary',
				green: 'bg-green-primary text-white-primary',
				slate: 'bg-slate-secondary text-white-primary',
				red: 'bg-red-primary text-white-primary',
				salmon: 'bg-[#F75F57] text-white-primary',
				teal: '!text-[#0C5E6A] !font-bold bg-transparent hover:bg-[#0C5E6A]/10',
				null: 'bg-transparent text-gray-600 hover:bg-[#0C5E6A]/10',
				pagination:
					'bg-[#0C5E6A] text-white-primary border border-gray-300 rounded-full hover:bg-gray-50', // New pagination variant
			},
			size: {
				default: 'h-7 px-6 rounded-xl text-sm',
				auth: 'h-12 px-6 rounded text-sm',
				modal: 'h-8 px-[17px] rounded-xl text-xs',
				card: 'h-10 rounded-xl px-6',
				pagination: 'h-9 w-9 rounded-full', // New pagination size
			},
		},
		defaultVariants: {
			size: 'default',
			variant: 'default',
		},
	},
);

type Props = {
	asChild?: boolean;
	isSubmitting?: boolean;
	direction?: 'left' | 'right'; // For pagination buttons
} & ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

const Button: FC<Props> = props => {
	const { isSubmitting, disabled, children, variant, size, className, direction, ...rest } = props;

	// Render pagination arrows if direction is specified
	const renderContent = () => {
		if (isSubmitting) {
			return (
				<>
					<Loader2 className='mr-2 h-4 w-4 animate-spin' />
					Please wait
				</>
			);
		}

		if (direction === 'left') {
			return <ChevronLeft size={18} />;
		}

		if (direction === 'right') {
			return <ChevronRight size={18} />;
		}

		return children;
	};

	return (
		<button
			className={cn(buttonVariants({ variant, size }), className)}
			disabled={disabled || isSubmitting}
			{...rest}
		>
			{renderContent()}
		</button>
	);
};

export { Button, buttonVariants };
