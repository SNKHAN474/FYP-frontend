import { LucideInfo } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';

type Props = {
	header: string;
	value: string | number | undefined;
	tooltip?: string;
};

const InfoRow: FC<Props> = ({ header, value, tooltip }) => {
	const [showTooltip, setShowTooltip] = useState(false);

	const elementRef = useRef<HTMLDivElement>(null);

	const handleTouch = (event: TouchEvent) => {
		if (!elementRef.current) return;

		if (elementRef.current.contains(event.target as Node)) {
			setShowTooltip(true);
		} else {
			setShowTooltip(false);
		}
	};

	useEffect(() => {
		if (!tooltip) return;

		document.addEventListener('touchstart', handleTouch);

		return () => {
			document.removeEventListener('touchstart', handleTouch);
		};
	}, []);

	return (
		<div className='relative'>
			<div
				className='flex items-center gap-x-1.5'
				ref={elementRef}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
			>
				<div className='flex grow gap-x-1'>
					<div className='text-xs text-slate-secondary'>{header}</div>
					{tooltip && <LucideInfo size={10} color='#5A5A5A' />}
				</div>	
				<div className='shrink-0 basis-24 text-sm font-bold'>
					{value}
					{header === 'Area' && !!value && <>&#178;</>}	
				</div>
			</div>
			{showTooltip && tooltip && (
				<div className='absolute right-0 z-50 text-wrap rounded-lg border border-slate-border bg-white-primary p-2 text-slate-secondary shadow-lg'>
					{tooltip}
				</div>
			)}
		</div>
	);
};

export default InfoRow;
