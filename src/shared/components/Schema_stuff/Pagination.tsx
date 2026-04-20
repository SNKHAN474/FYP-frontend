// Pagination.tsx
import { Button } from '../Button'; // Adjust imports to your project
import TextInput from '../TextInput';
import { useState, useEffect } from 'react';

interface PaginationProps {
	currentPage: number; // 0-indexed
	totalPages: number;
	totalItems: number;
	rowsPerPage: number;
	onPageChange: (page: number) => void;
}

export const Pagination = ({
	currentPage,
	totalPages,
	totalItems,
	rowsPerPage,
	onPageChange,
}: PaginationProps) => {
	const [localInput, setLocalInput] = useState((currentPage + 1).toString());

	// Sync input if page changes via buttons
	useEffect(() => {
		setLocalInput((currentPage + 1).toString());
	}, [currentPage]);

	const startIndex = currentPage * rowsPerPage;
	const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

	const handleSubmit = () => {
		const val = parseInt(localInput);
		if (!isNaN(val) && val > 0 && val <= totalPages) {
			onPageChange(val - 1);
		} else {
			setLocalInput((currentPage + 1).toString());
		}
	};

	return (
		<div className='border-gray-800 relative mt-6 flex items-center justify-between border-t pb-4 pt-4'>
			<div className='text-gray-600 text-sm'>
				Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} patients
			</div>

			<div className='absolute left-1/2 -translate-x-1/2'>
				<div className='flex items-center gap-2'>
					<Button
						variant='pagination'
						size='pagination'
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 0}
						direction='left'
					/>

					<div className='flex items-center gap-2'>
						<div className='h-9 w-12'>
							<TextInput
								value={localInput}
								onChange={e => setLocalInput(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && handleSubmit()}
								onBlur={handleSubmit}
								className='border-gray-300 bg-white text-gray-700 h-9 w-12 rounded-lg border px-0 text-center text-sm font-medium shadow-sm focus:border-[#0E5C64] focus:outline-none focus:ring-2 focus:ring-[#0E5C64]/20'
							/>
						</div>
						<span className='text-gray-500 mx-1 text-sm'>of</span>
						<div className='h-9 w-12'>
							<TextInput
								value={totalPages.toString()}
								readOnly
								className='h-9 w-12 cursor-default rounded-lg border-2 border-[#0E5C64] bg-gradient-to-b from-[#0E5C64]/5 to-[#0E5C64]/10 px-0 text-center text-sm font-bold text-[#0E5C64] shadow-sm'
							/>
						</div>
					</div>

					<Button
						variant='pagination'
						size='pagination'
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages - 1}
						direction='right'
					/>
				</div>
			</div>
			<div className='w-40'></div>
		</div>
	);
};
