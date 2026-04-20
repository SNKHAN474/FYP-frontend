import React, { useEffect, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { Patient } from '../../../types/PatientSchemaTypes';

interface Props {
	patient: Patient;
}

export const PersonalDetailsCard: React.FC<Props> = ({ patient }) => {
	const details = patient?.['Personal Details'] ?? {};

	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState(details);
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		setFormData(details);
	}, [details]);

	const handleChange = (field: string, value: string) => {
		setFormData((prev: any) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleContactChange = (field: string, value: string) => {
		setFormData((prev: any) => ({
			...prev,
			ContactDetails: {
				...prev.ContactDetails,
				[field]: value,
			},
		}));
	};

	const handleSave = async () => {
		try {
			const res = await fetch(`http://localhost:3000/patients/${patient._id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					personalDetails: formData,
				}),
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

	const Field = ({ label, value, onChange, type = 'text', options }: any) => (
		<div className='grid grid-cols-2 items-center gap-x-4 py-2'>
			<p className='text-slate-500 text-sm font-medium'>{label}</p>

			{isEditing ? (
				type === 'select' ? (
					<select
						value={value || ''}
						onChange={e => onChange(e.target.value)}
						className='rounded-md border px-2 py-1 text-sm'
					>
						<option value=''>Select</option>
						{options.map((opt: string) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				) : (
					<input
						value={value || ''}
						onChange={e => onChange(e.target.value)}
						className='rounded-md border px-2 py-1 text-sm'
					/>
				)
			) : (
				<p className='text-slate-800 text-sm font-medium'>{value ? value : '—'}</p>
			)}
		</div>
	);

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
					label='Name'
					value={formData.Name}
					onChange={(v: string) => handleChange('Name', v)}
				/>

				<Field
					label='Date of Birth'
					value={formData.DateOfBirth}
					onChange={(v: string) => handleChange('DateOfBirth', v)}
				/>

				<Field
					label='Gender'
					value={formData.Gender}
					type='select'
					options={['Male', 'Female', 'Other']}
					onChange={(v: string) => handleChange('Gender', v)}
				/>

				<Field
					label='Height (cm)'
					value={formData.Height}
					onChange={(v: string) => handleChange('Height', v)}
				/>

				<Field
					label='Weight (kg)'
					value={formData.Weight}
					onChange={(v: string) => handleChange('Weight', v)}
				/>

				<Field
					label='Last Visit'
					value={formData.LastVisitDate}
					onChange={(v: string) => handleChange('LastVisitDate', v)}
				/>

				<Field
					label='Next Visit'
					value={formData.NextVisitDate}
					onChange={(v: string) => handleChange('NextVisitDate', v)}
				/>

				{/* Contact Info */}
				<Field
					label='Phone'
					value={formData?.ContactDetails?.Phone}
					onChange={(v: string) => handleContactChange('Phone', v)}
				/>

				<Field
					label='Email'
					value={formData?.ContactDetails?.EmailAddress}
					onChange={(v: string) => handleContactChange('EmailAddress', v)}
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
