import React, { useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { Patient } from '../../../types/PatientSchemaTypes';

interface Props {
	patient: Patient;
}

export const MedicationsCard: React.FC<Props> = ({ patient }) => {
	const details = patient?.DiabetesInfo ?? {};

	const [isEditing, setIsEditing] = useState(false);
	const [medicationsInfo, setMedicationsInfo] = useState(details.MedicationsInfo || '');
	const [showSuccess, setShowSuccess] = useState(false);

	const handleSave = async () => {
		if (!medicationsInfo.trim()) return;

		try {
			const res = await fetch(`http://localhost:3000/patients/${patient._id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					DiabetesInfo: {
						MedicationsInfo: medicationsInfo,
					},
				}),
			});

			if (res.ok) {
				const updatedPatient: Patient = await res.json();

				setMedicationsInfo(updatedPatient.DiabetesInfo?.MedicationsInfo || medicationsInfo);

				setIsEditing(false);
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 3000);
			}
		} catch (error) {
			console.error('Update error:', error);
		}
	};

	return (
		<div className='w-full rounded-2xl bg-white-primary p-6 shadow-sm'>
			<div className='mb-6 flex items-center justify-between'>
				<h3 className='text-slate-800 text-left text-lg font-semibold'>Medication</h3>

				<div className='flex items-center gap-3'>
					{showSuccess && (
						<span className='text-teal-600 text-sm font-medium animate-in fade-in zoom-in'>
							✓ Updated
						</span>
					)}

					<NotebookPen
						size={18}
						className='text-slate-500 hover:text-teal-600 cursor-pointer transition-colors'
						onClick={() => setIsEditing(true)}
					/>
				</div>
			</div>

			{isEditing ? (
				<div className='border-t pt-4 animate-in fade-in slide-in-from-bottom-2'>
					<textarea
						autoFocus
						rows={3}
						value={medicationsInfo}
						onChange={e => setMedicationsInfo(e.target.value)}
						className='border-gray-200 bg-gray-50 focus:border-teal-500 w-full rounded-lg border p-3 text-sm transition focus:outline-none'
						placeholder='Enter current medications...'
					/>

					<div className='mt-3 flex gap-3'>
						<button
							onClick={handleSave}
							className='bg-teal-600 text-white hover:bg-teal-700 flex-1 rounded-lg py-2 text-sm font-semibold shadow-sm transition'
						>
							Save
						</button>

						<button
							onClick={() => {
								setIsEditing(false);
								setMedicationsInfo(details.MedicationsInfo || '');
							}}
							className='border-gray-200 text-slate-500 hover:bg-gray-50 rounded-lg border px-4 py-2 text-sm font-medium transition'
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<div className='flex flex-col'>
					<p className='text-slate-700 text-sm leading-relaxed'>
						{medicationsInfo || 'No medications recorded.'}
					</p>
				</div>
			)}
		</div>
	);
};
