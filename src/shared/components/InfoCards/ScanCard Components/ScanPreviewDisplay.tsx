import React from 'react';

interface ScanPreviewDisplayProps {
	isLoading: boolean;
	imageUrl: string | null;
	activeView: 'rgb' | 'depth';
	onClick: () => void;
}

const ScanPreviewDisplay: React.FC<ScanPreviewDisplayProps> = ({
	isLoading,
	imageUrl,
	activeView,
	onClick,
}) => {
	return (
		<div
			onClick={onClick}
			className='border-gray-200 bg-black hover:ring-blue-500/10 mb-6 flex min-h-[300px] cursor-pointer items-center justify-center overflow-hidden rounded-md border transition-all hover:ring-4'
		>
			{isLoading ? (
				<div className='text-white animate-pulse text-sm'>Processing {activeView}...</div>
			) : imageUrl ? (
				<img src={imageUrl} className='h-auto w-full object-contain' alt='Scan Preview' />
			) : (
				<div className='flex flex-col items-center gap-2'>
					<svg
						className='text-slate-600 h-8 w-8'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.5}
							d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
						/>
					</svg>
					<div className='text-gray-400 text-sm italic'>No {activeView} preview available</div>
				</div>
			)}
		</div>
	);
};

export default ScanPreviewDisplay;
