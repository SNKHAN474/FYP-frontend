import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react'; // Added for visual feedback

interface GradingFormProps {
	patientId: string;
	result: {
		area: number;
		ulcerDepth: number;
	};
	onSave: (
		manualScores: any,
		totalGrade: number,
		nextVisit: string,
		ulcerId: string,
	) => Promise<void>; // Changed to Promise
	onCancel: () => void;
}

const GradingForm: React.FC<GradingFormProps> = ({ patientId, result, onSave, onCancel }) => {
	const [manualScores, setManualScores] = useState({
		site: 0,
		ischemia: 0,
		neuropathy: 0,
		bacterialInfection: 0,
	});

	const [existingUlcers, setExistingUlcers] = useState<any[]>([]);
	const [selectedUlcerId, setSelectedUlcerId] = useState<string>('NEW');

	// NEW: Loading and Success states
	const [isSaving, setIsSaving] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		const fetchPatientData = async () => {
			try {
				const res = await fetch(`http://localhost:3000/patients/${patientId}`);
				const data = await res.json();
				if (data.Ulcers) {
					setExistingUlcers(data.Ulcers);
				}
			} catch (err) {
				console.error('Failed to fetch existing ulcers', err);
			}
		};
		fetchPatientData();
	}, [patientId]);

	const getDefaultDate = () => {
		const date = new Date();
		date.setDate(date.getDate() + 7);
		return date.toISOString().split('T')[0];
	};
	const [nextVisit, setNextVisit] = useState(getDefaultDate());

	const areaScore = result.area >= 100 ? 1 : 0;
	const depthScore = result.ulcerDepth > 10 ? 1 : 0;
	const totalGrade =
		Object.values(manualScores).reduce((a, b) => a + b, 0) + areaScore + depthScore;

	const handleConfirm = async () => {
		setIsSaving(true);
		try {
			const finalUlcerId = selectedUlcerId === 'NEW' ? `ULC-${Date.now()}` : selectedUlcerId;

			// Wait for the parent's onSave function to finish
			await onSave(manualScores, totalGrade, nextVisit, finalUlcerId);

			setIsSuccess(true);

			// Delay briefly so the user sees the "Success" message before the reload
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (error) {
			console.error('Save failed:', error);
			alert('Failed to save record. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	// SUCCESS OVERLAY: This shows up inside the modal when isSuccess is true
	if (isSuccess) {
		return (
			<div className='bg-slate-900/40 absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
				<div className='bg-white flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-8 text-center shadow-2xl'>
					<div className='bg-green-100 rounded-full p-4'>
						<CheckCircle2 className='text-green-600 h-12 w-12 animate-bounce' />
					</div>
					<div>
						<h3 className='text-slate-800 text-2xl font-bold'>Update Successful</h3>
						<p className='text-slate-500 mt-2'>
							The patient record has been synchronized.
							<br />
							Refreshing clinical dashboard...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-slate-900/40 absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
			<div className='border-slate-200 max-h-[95vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-white-primary p-6 shadow-2xl'>
				<div className='mb-6'>
					<h3 className='text-slate-800 text-xl font-bold'>Clinical Assessment</h3>
					<p className='text-slate-500 text-sm'>Select Ulcer & Grade</p>
				</div>

				<div className='mb-6 space-y-4'>
					<div className='border-amber-100 bg-amber-50 rounded-xl border p-3'>
						<label className='text-amber-800 mb-1.5 block text-xs font-bold uppercase tracking-wider'>
							Target Ulcer
						</label>
						<select
							className='border-amber-200 bg-white focus:ring-amber-500 w-full rounded-md border p-2 text-sm font-medium focus:outline-none focus:ring-2'
							value={selectedUlcerId}
							onChange={e => setSelectedUlcerId(e.target.value)}
							disabled={isSaving}
						>
							<option value='NEW'>✨ New Ulcer</option>
							{existingUlcers.map(u => (
								<option key={u.ulcerId || u._id} value={u.ulcerId || u._id}>
									Existing Ulcer (Grade: {u.UlcerGrade})
								</option>
							))}
						</select>
					</div>

					{['site', 'ischemia', 'neuropathy', 'bacterialInfection'].map(key => (
						<div
							key={key}
							className='border-slate-100 bg-slate-50 flex items-center justify-between rounded-xl border p-3'
						>
							<span className='text-slate-700 text-sm font-semibold capitalize'>{key}</span>
							<select
								className='border-slate-200 rounded border px-2 py-1 text-sm'
								value={manualScores[key as keyof typeof manualScores]}
								onChange={e =>
									setManualScores(prev => ({ ...prev, [key]: parseInt(e.target.value) }))
								}
								disabled={isSaving}
							>
								<option value={0}>0</option>
								<option value={1}>1</option>
							</select>
						</div>
					))}

					<div className='border-blue-100 bg-blue-50/30 rounded-xl border p-3'>
						<label className='text-slate-700 mb-1 block text-sm font-semibold'>Next Visit</label>
						<input
							type='date'
							className='border-slate-200 w-full rounded-md border p-2 text-sm'
							value={nextVisit}
							onChange={e => setNextVisit(e.target.value)}
							disabled={isSaving}
						/>
					</div>

					<div className='bg-blue-600 text-white rounded-xl p-4 shadow-lg'>
						<div className='flex items-end justify-between'>
							<span className='text-sm font-bold uppercase tracking-widest'>SINBAD Grade</span>
							<span className='text-3xl font-black'>{totalGrade}/6</span>
						</div>
					</div>
				</div>

				<div className='flex gap-3'>
					<button
						onClick={handleConfirm}
						disabled={isSaving}
						className='bg-slate-800 text-white hover:bg-slate-700 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold transition-colors disabled:opacity-50'
					>
						{isSaving ? (
							<>
								<Loader2 className='h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							'Confirm & Save'
						)}
					</button>
					<button
						onClick={onCancel}
						disabled={isSaving}
						className='border-slate-200 text-slate-400 hover:bg-slate-50 rounded-xl border-2 px-6 py-3 font-bold transition-colors disabled:opacity-50'
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default GradingForm;
