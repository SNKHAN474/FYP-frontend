import React, { useEffect, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { Patient } from '../../../types/PatientSchemaTypes';

interface Props {
	patient: Patient;
}

interface FieldProps {
	label: string;
	value: string;
	onChange: (v: string) => void;
	isEditing: boolean;
	type?: 'text' | 'select' | 'date'; // Added 'date' type
	options?: string[];
	readOnly?: boolean; // Added readOnly prop
}

const Field: React.FC<FieldProps> = ({
	label,
	value,
	onChange,
	isEditing,
	type = 'text',
	options,
	readOnly = false, // Default to false
}) => {
	// Helper to format stored date (YYYY-MM-DD) to Display (DD/MM/YYYY)
	const formatDisplayDate = (dateStr: string) => {
		if (!dateStr || !dateStr.includes('-')) return dateStr;
		const [year, month, day] = dateStr.split('-');
		return `${day}/${month}/${year}`;
	};

	// If the field is readOnly, it stays as text even if the card is in "isEditing" mode
	const effectiveEditing = isEditing && !readOnly;

	return (
		<div className='grid grid-cols-2 items-center gap-x-4 py-2'>
			<p className='text-slate-500 text-sm font-medium'>{label}</p>

			{effectiveEditing ? (
				type === 'select' ? (
					<select
						value={value || ''}
						onChange={e => onChange(e.target.value)}
						className='rounded-md border px-2 py-1 text-sm'
					>
						<option value=''>Select</option>
						{options?.map((opt: string) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				) : (
					<input
						type={type === 'date' ? 'date' : 'text'}
						value={value || ''}
						onChange={e => onChange(e.target.value)}
						className='rounded-md border px-2 py-1 text-sm'
					/>
				)
			) : (
				<p className='text-slate-800 text-sm font-medium'>
					{type === 'date' ? formatDisplayDate(value) || '—' : value || '—'}
				</p>
			)}
		</div>
	);
};

export const PersonalDetailsCard: React.FC<Props> = ({ patient }) => {
	const details = patient?.['Personal Details'] ?? {};

	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState(details);
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		setFormData(details);
	}, [details]);

	const handleChange = (field: string, value: string) => {
		setFormData((prev: any) => ({ ...prev, [field]: value }));
	};

	const handleContactChange = (field: string, value: string) => {
		setFormData((prev: any) => ({
			...prev,
			ContactDetails: { ...prev.ContactDetails, [field]: value },
		}));
	};

	const handleSave = async () => {
		try {
			const res = await fetch(`http://localhost:3000/patients/${patient._id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ personalDetails: formData }),
			});

			if (res.ok) {
				setIsEditing(false);
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 3000);
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className='w-full rounded-2xl bg-white-primary p-6 shadow-sm'>
			<div className='mb-6 flex justify-between'>
				<h3 className='text-slate-800 text-lg font-semibold'>Personal Details</h3>

				<div className='flex items-center gap-3'>
					{showSuccess && <span className='text-teal-600 text-sm font-medium'>✓ Updated</span>}
					<NotebookPen
						size={18}
						className='text-slate-500 hover:text-teal-600 cursor-pointer'
						onClick={() => setIsEditing(true)}
					/>
				</div>
			</div>

			<div className='flex flex-col'>
				<Field
					label='First Name'
					value={formData.FName}
					onChange={v => handleChange('FName', v)}
					isEditing={isEditing}
				/>
				<Field
					label='Last Name'
					value={formData.Lname}
					onChange={v => handleChange('Lname', v)}
					isEditing={isEditing}
				/>
				<Field
					label='Date of Birth'
					value={formData.DateOfBirth}
					onChange={v => handleChange('DateOfBirth', v)}
					isEditing={isEditing}
					type='date'
					readOnly={true} // LOCKED: Cannot be edited
				/>
				<Field
					label='Gender'
					value={formData.Gender}
					onChange={v => handleChange('Gender', v)}
					isEditing={isEditing}
					type='select'
					options={['Male', 'Female', 'Other']}
				/>
				<Field
					label='Height (cm)'
					value={formData.Height}
					onChange={v => handleChange('Height', v)}
					isEditing={isEditing}
				/>
				<Field
					label='Weight (kg)'
					value={formData.Weight}
					onChange={v => handleChange('Weight', v)}
					isEditing={isEditing}
				/>
				<Field
					label='Last Visit'
					value={formData.LastVisitDate}
					onChange={v => handleChange('LastVisitDate', v)}
					isEditing={isEditing}
					type='date'
					readOnly={true} // LOCKED
				/>
				<Field
					label='Next Visit'
					value={formData.NextVisitDate}
					onChange={v => handleChange('NextVisitDate', v)}
					isEditing={isEditing}
					type='date'
					readOnly={true} // LOCKED
				/>
				<Field
					label='Phone'
					value={formData?.ContactDetails?.Phone}
					onChange={v => handleContactChange('Phone', v)}
					isEditing={isEditing}
				/>
				<Field
					label='Email'
					value={formData?.ContactDetails?.EmailAddress}
					onChange={v => handleContactChange('EmailAddress', v)}
					isEditing={isEditing}
				/>
			</div>

			{isEditing && (
				<div className='mt-6 flex gap-3 border-t pt-4'>
					<button
						onClick={handleSave}
						className='bg-teal-600 text-white flex-1 rounded-lg py-2 text-sm font-semibold'
					>
						Save Changes
					</button>
					<button
						onClick={() => {
							setIsEditing(false);
							setFormData(details);
						}}
						className='rounded-lg border px-4 py-2 text-sm'
					>
						Cancel
					</button>
				</div>
			)}
		</div>
	);
};
