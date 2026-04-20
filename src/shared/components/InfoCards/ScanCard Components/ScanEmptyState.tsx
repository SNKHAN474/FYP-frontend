import React from 'react';
import UploadScanDataButton from '../../UploadScanDataButton';

export const ScanEmptyState: React.FC<{ patientId: string }> = ({ patientId }) => (
	<div className='border-slate-300 flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-dashed p-6 shadow-sm'>
		<div className='text-center'>
			<div className='bg-slate-50 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
				<svg
					className='text-slate-300 h-10 w-10'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={1.5}
						d='M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z'
					/>
				</svg>
			</div>
			<h3 className='text-slate-800 text-xl font-bold'>No Scan Information</h3>
			<p className='text-slate-500 mt-2 max-w-xs text-sm'>
				There are currently no recorded scans for this patient.
			</p>
			<div className='mt-8'>
				<UploadScanDataButton patientId={patientId} />
			</div>
		</div>
	</div>
);
