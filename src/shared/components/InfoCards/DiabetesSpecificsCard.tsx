import React, { useEffect, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { Patient, DiabetesInfo } from '../../../types/PatientSchemaTypes';

interface Props {
	patient: Patient;
}

interface RowProps {
	label: string;
	field?: keyof DiabetesInfo;
	unit?: string;
	isEditing: boolean;
	formData: DiabetesInfo;
	handleChange: (field: keyof DiabetesInfo, value: string | boolean) => void;
	type?: 'text' | 'checkbox';
}

const Row: React.FC<RowProps> = ({
	label,
	field,
	unit = '',
	isEditing,
	formData,
	handleChange,
	type = 'text',
}) => {
	const value = formData?.[field as keyof DiabetesInfo];

	return (
		<div className='grid grid-cols-2 items-center gap-x-4 py-2'>
			<p className='text-slate-500 text-sm font-medium'>{label}</p>

			{isEditing && field ? (
				type === 'checkbox' ? (
					<input
						type='checkbox'
						checked={Boolean(value)}
						onChange={e => handleChange(field, e.target.checked)}
					/>
				) : (
					<input
						value={(value as string | number | undefined) ?? ''}
						onChange={e => handleChange(field, e.target.value)}
						className='border-gray-200 focus:border-teal-500 rounded-md border px-2 py-1 text-sm focus:outline-none'
					/>
				)
			) : (
				<p className='text-slate-800 text-sm font-medium'>
					{value !== undefined && value !== null && value !== ''
						? type === 'checkbox'
							? value
								? 'Yes'
								: 'No'
							: `${value}${unit}`
						: '—'}
				</p>
			)}
		</div>
	);
};

export const DiabetesSpecificsCard: React.FC<Props> = ({ patient }) => {
	const details = patient.DiabetesInfo ?? {};

	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<DiabetesInfo>(details);
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		setFormData(details);
	}, [details]);

	const handleChange = (field: keyof DiabetesInfo, value: string | boolean) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		try {
			const res = await fetch(`http://localhost:3000/patients/${patient._id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					DiabetesInfo: formData,
				}),
			});

			if (res.ok) {
				const updated: Patient = await res.json();
				setFormData(updated.DiabetesInfo ?? {});
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
				<h3 className='text-slate-800 text-lg font-semibold'>Diabetes Specifics</h3>

				<div className='flex items-center gap-3'>
					{showSuccess && (
						<span className='text-teal-600 text-sm font-medium animate-in fade-in zoom-in'>
							✓ Updated
						</span>
					)}

					<NotebookPen
						size={18}
						className='text-slate-500 hover:text-teal-600 cursor-pointer'
						onClick={() => setIsEditing(true)}
					/>
				</div>
			</div>

			<div className='flex flex-col'>
				<Row
					label='Type of diabetes'
					field='DiabetesType'
					{...{ isEditing, formData, handleChange }}
				/>

				<Row
					label='Previous amputation'
					field='PreviousAmputation'
					type='checkbox'
					{...{ isEditing, formData, handleChange }}
				/>

				<Row
					label='Years diagnosed'
					field='YearsDiagnosed'
					{...{ isEditing, formData, handleChange }}
				/>

				{/* ✅ MATCHES SCHEMA */}
				<Row
					label='Previous foot treatment'
					field='PreviousTreatments'
					{...{ isEditing, formData, handleChange }}
				/>

				<Row
					label='Other complications'
					field='OtherDiabeticAssociatedComplications'
					{...{ isEditing, formData, handleChange }}
				/>

				<Row
					label='Last HbA1c reading'
					field='LastHb1AcReading'
					unit=' mmol/mol'
					{...{ isEditing, formData, handleChange }}
				/>

				<Row
					label='Last lipid profile'
					field='LastLipidProfile'
					unit=' mg/dL'
					{...{ isEditing, formData, handleChange }}
				/>

				{/* ❌ REMOVED LatestBP (not in schema) */}

				<Row
					label='On medication'
					field='Medication'
					type='checkbox'
					{...{ isEditing, formData, handleChange }}
				/>

				<Row
					label='Medication details'
					field='MedicationsInfo'
					{...{ isEditing, formData, handleChange }}
				/>

				<Row
					label='DM or CV complications'
					field='OtherDMOrCVComplications'
					{...{ isEditing, formData, handleChange }}
				/>
			</div>

			{isEditing && (
				<div className='mt-6 flex gap-3 border-t pt-4'>
					<button
						onClick={handleSave}
						className='bg-teal-600 text-white hover:bg-teal-700 flex-1 rounded-lg py-2 text-sm font-semibold shadow-sm transition'
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
