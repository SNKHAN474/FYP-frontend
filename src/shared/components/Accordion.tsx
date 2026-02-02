import { type FC, type ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { cn } from '../utils/helpers';

type Props = {
	title: string;
	defaultOpen?: boolean;
	animationDuration: number;
	children: ReactNode;
};

const Accordion: FC<Props> = ({ title, children, animationDuration, defaultOpen = true }) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className='rounded-lg border border-slate-border bg-white-primary p-3'>
			<div className='flex cursor-pointer justify-between' onClick={() => setIsOpen(!isOpen)}>
				<h1 className='text-lg font-bold text-slate-secondary'>{title}</h1>
				<ChevronUp
					size={30}
					className={cn('transition-all duration-200', { 'rotate-180': !isOpen })}
				/>
			</div>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0 }}
						animate={{ height: 'auto' }}
						exit={{ height: 0 }}
						transition={{ duration: animationDuration }}
						className='overflow-hidden'
					>
						<div className='flex flex-col mt-3'>{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Accordion;
