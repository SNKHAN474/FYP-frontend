import React from 'react';
import Dropdown from './Dropdown';
import TextInput from './TextInput';

type FilterProps = {
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	ulcerGradeFilter: string;
	setUlcerGradeFilter: (value: string) => void;
	sortBy: string;
	setSortBy: (value: string) => void;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
};

const PatientsTableFilters: React.FC<FilterProps> = ({
	statusFilter,
	setStatusFilter,
	ulcerGradeFilter,
	setUlcerGradeFilter,
	sortBy,
	setSortBy,
	searchTerm,
	setSearchTerm,
}) => {
	// Status filter options
	const statusOptions = [
		{ label: 'Please Select', value: '' },
		{ label: 'New', value: 'New' },
		{ label: 'Active', value: 'Active' },
		{ label: 'In-Active', value: 'In-Active' },
		{ label: 'Warning', value: 'Warning' },
	];

	// Ulcer grade filter options - just single grades now since we check for number
	const ulcerGradeOptions = [
		{ label: 'Please Select', value: '' },
		{ label: 'Grade 1', value: '1' },
		{ label: 'Grade 2', value: '2' },
		{ label: 'Grade 3', value: '3' },
		{ label: 'Grade 4', value: '4' },
		{ label: 'Grade 5', value: '5' },
		{ label: 'Grade 6', value: '6' },
	];

	// Sort options
	const sortOptions = [
		{ label: 'First Next Treatment Date', value: 'nextVisit' },
		{ label: 'Last Visit Date', value: 'lastVisit' },
		{ label: 'Treatment Start Date', value: 'startDate' },
		{ label: 'Name', value: 'name' },
		{ label: 'Age', value: 'age' },
	];

	return (
		<div className='p-4 shadow-sm'>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
				{/* Status Filter */}
				<div className='md:col-span-3'>
					<Dropdown
						label='Status'
						placeholderLabel='Please Select'
						value={statusFilter}
						updateValue={setStatusFilter}
						options={statusOptions}
					/>
				</div>

				{/* Ulcer Grade Filter */}
				<div className='md:col-span-3'>
					<Dropdown
						label='Ulcer Grade'
						placeholderLabel='Please Select'
						value={ulcerGradeFilter}
						updateValue={setUlcerGradeFilter}
						options={ulcerGradeOptions}
					/>
				</div>

				{/* Sort By Filter */}
				<div className='md:col-span-3'>
					<Dropdown
						label='Sort By'
						placeholderLabel='Please Select'
						value={sortBy}
						updateValue={setSortBy}
						options={sortOptions}
					/>
				</div>

				{/* Search Input */}
				<div className='md:col-span-3'>
					<TextInput
						label='Search'
						placeholder='Search patients...'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='h-10'
					/>
				</div>
			</div>
		</div>
	);
};

export default PatientsTableFilters;
