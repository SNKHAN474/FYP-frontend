import React, { useState } from 'react';
import { Plus, X, Trash2, Activity, Pill } from 'lucide-react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Button } from './Button';

const CreateNewPatientButton = () => {
	const [isOpen, setIsOpen] = useState(false);

	const { register, handleSubmit, control, reset } = useForm({
		defaultValues: {
			ClinicianId: '',
			PatientId: '',
			Name: '',
			UserNumber: '',
			'Personal Details': {
				PatientId: '',
				DateOfBirth: '',
				Name: '',
				TreatmentStartDate: '',
				Status: 'New',
				Gender: 'Other',
				Height: '',
				Weight: '',
				ContactDetails: { Phone: '', EmailAddress: '' },
			},
			DiabetesInfo: {
				DiabetesType: 1,
				PreviousAmputation: false,
				YearsDiagnosed: '',
				Medication: false,
				MedicationsInfo: '',
				LastHb1AcReading: '',
			},
			MedicalHistory: '',
			Ulcers: [], // Starts empty so no blank records are pushed by default
			FootGraph: [],
		},
	});

	// Watch the Medication checkbox to show/hide the medication input
	const isOnMedication = useWatch({
		control,
		name: 'DiabetesInfo.Medication',
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'Ulcers',
	});

	const formatToBritishDate = (dateString: string) => {
		if (!dateString) return '';
		const [year, month, day] = dateString.split('-');
		return `${day}/${month}/${year}`;
	};

	const onSubmit = async (data: any) => {
		try {
			// 1. Deep clone the data to avoid modifying the form state directly
			let formattedData = JSON.parse(JSON.stringify(data));

			// 2. FILTER ULCERS: Only keep ulcers that have actual data entered
			// This prevents the "random 0s" or empty objects in your MongoDB
			if (formattedData.Ulcers) {
				formattedData.Ulcers = formattedData.Ulcers.filter((u: any) => {
					const hasGrade = u.UlcerGrade && u.UlcerGrade.toString().trim() !== '';
					const hasVolume = u.Volume && u.Volume.toString().trim() !== '';
					const hasDepth = u.Depth && u.Depth.toString().trim() !== '';
					const hasTemp = u.UlcerTemperature && u.UlcerTemperature.toString().trim() !== '';

					return hasGrade || hasVolume || hasDepth || hasTemp;
				});
			}

			// 3. Format dates to British standard (DD/MM/YYYY) for your DB
			if (data['Personal Details']?.DateOfBirth) {
				formattedData['Personal Details'].DateOfBirth = formatToBritishDate(
					data['Personal Details'].DateOfBirth,
				);
			}

			if (data['Personal Details']?.TreatmentStartDate) {
				formattedData['Personal Details'].TreatmentStartDate = formatToBritishDate(
					data['Personal Details'].TreatmentStartDate,
				);
			}

			// 4. Submit to Backend
			const response = await fetch('http://localhost:3000/patients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formattedData),
			});

			if (response.ok) {
				alert('Patient Created Successfully');
				setIsOpen(false);
				reset();
			} else {
				const errorData = await response.json();
				alert(`Error: ${errorData.message || 'Failed to save patient'}`);
			}
		} catch (error) {
			console.error('Error saving patient:', error);
			alert('Network error. Check if the server is running.');
		}
	};

	return (
		<>
			<div className='mt-6 flex'>
				<Button
					variant='salmon'
					size='card'
					className='-mt-4 ml-auto rounded-none px-4 py-4 text-lg font-normal'
					onClick={() => setIsOpen(true)}
				>
					Create New Patient
					<Plus className='ml-2 h-5 w-5' />
				</Button>
			</div>

			{isOpen && (
				<div className='bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
					<div className='max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white-primary p-8 shadow-2xl'>
						<div className='mb-6 flex items-center justify-between border-b pb-4'>
							<h2 className='text-gray-800 text-2xl font-bold'>New Patient Entry</h2>
							<button onClick={() => setIsOpen(false)} className='text-gray-500 hover:text-black'>
								<X className='h-6 w-6' />
							</button>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
							{/* SECTION: IDs & Core Info */}
							<div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
								<div className='flex flex-col gap-1'>
									<label className='text-gray-500 text-xs font-semibold'>Full Name</label>
									<input
										{...register('Personal Details.Name')}
										placeholder='Full Name'
										className='rounded border p-2'
										required
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label className='text-gray-500 text-xs font-semibold'>Patient ID</label>
									<input
										{...register('PatientId')}
										placeholder='ID'
										className='rounded border p-2'
										required
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label className='text-gray-500 text-xs font-semibold'>User Number</label>
									<input
										{...register('UserNumber')}
										placeholder='User #'
										className='rounded border p-2'
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label className='text-gray-500 text-xs font-semibold'>Clinician ID</label>
									<input
										{...register('ClinicianId')}
										placeholder='Clinician ID'
										className='rounded border p-2'
									/>
								</div>
							</div>

							{/* SECTION: Personal Details */}
							<div className='border-gray-200 bg-white/40 space-y-4 rounded-lg border p-4'>
								<h3 className='text-salmon flex items-center gap-2 border-b pb-2 font-semibold'>
									<Activity className='h-4 w-4' /> Personal Details
								</h3>
								<div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
									<div className='flex flex-col'>
										<label className='text-gray-400 text-[10px] font-semibold uppercase tracking-wider'>
											Date of Birth
										</label>
										<input
											{...register('Personal Details.DateOfBirth')}
											type='date'
											className='bg-white rounded border p-1 text-sm'
										/>
									</div>

									<select
										{...register('Personal Details.Gender')}
										className='bg-white rounded border p-2'
									>
										<option value='Male'>Male</option>
										<option value='Female'>Female</option>
										<option value='Other'>Other</option>
									</select>
									<input
										{...register('Personal Details.Height')}
										placeholder='Height (cm)'
										className='bg-white rounded border p-2'
									/>
									<input
										{...register('Personal Details.Weight')}
										placeholder='Weight (kg)'
										className='bg-white rounded border p-2'
									/>
									<input
										{...register('Personal Details.ContactDetails.Phone')}
										placeholder='Phone'
										className='bg-white rounded border p-2'
									/>
									<input
										{...register('Personal Details.ContactDetails.EmailAddress')}
										placeholder='Email'
										className='bg-white rounded border p-2'
									/>

									<select
										{...register('Personal Details.Status')}
										className='bg-white rounded border p-2'
									>
										<option value='New'>New</option>
										<option value='Active'>Active</option>
										<option value='Warning'>Warning</option>
									</select>

									<div className='flex flex-col'>
										<label className='text-gray-400 text-[10px] font-semibold uppercase tracking-wider'>
											Treatment Start
										</label>
										<input
											{...register('Personal Details.TreatmentStartDate')}
											type='date'
											className='bg-white rounded border p-1 text-sm'
										/>
									</div>
								</div>
							</div>

							{/* SECTION: Diabetes Info */}
							<div className='border-gray-200 bg-white/40 space-y-4 rounded-lg border p-4'>
								<h3 className='text-salmon border-b pb-2 font-semibold'>Diabetes Information</h3>
								<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
									<select
										{...register('DiabetesInfo.DiabetesType')}
										className='bg-white rounded border p-2'
									>
										<option value={1}>Type 1</option>
										<option value={2}>Type 2</option>
									</select>
									<input
										{...register('DiabetesInfo.YearsDiagnosed')}
										placeholder='Years Diagnosed'
										className='bg-white rounded border p-2'
									/>
									<input
										{...register('DiabetesInfo.LastHb1AcReading')}
										placeholder='Last Hb1Ac Reading'
										className='bg-white rounded border p-2'
									/>

									<label className='flex cursor-pointer items-center gap-2 text-sm'>
										<input
											type='checkbox'
											{...register('DiabetesInfo.PreviousAmputation')}
											className='accent-salmon h-4 w-4'
										/>
										Previous Amputation?
									</label>

									<label className='flex cursor-pointer items-center gap-2 text-sm'>
										<input
											type='checkbox'
											{...register('DiabetesInfo.Medication')}
											className='accent-salmon h-4 w-4'
										/>
										On Medication?
									</label>
								</div>

								{isOnMedication && (
									<div className='mt-4 duration-300 animate-in fade-in slide-in-from-top-2'>
										<div className='flex flex-col gap-1'>
											<label className='text-gray-500 flex items-center gap-1 text-xs font-semibold'>
												<Pill className='h-3 w-3' /> Current Medications
											</label>
											<textarea
												{...register('DiabetesInfo.MedicationsInfo')}
												placeholder='List medications, dosages, and frequency...'
												className='bg-white min-h-[80px] rounded border p-2 text-sm shadow-sm'
											/>
										</div>
									</div>
								)}
							</div>

							{/* SECTION: Ulcers */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between border-b pb-2'>
									<h3 className='text-salmon font-semibold'>Ulcers / Wound Data</h3>
									<button
										type='button'
										onClick={() =>
											append({
												ulcerId: `ULC-${Date.now()}`,
												UlcerGrade: '',
												NumberOfScans: 0,
												Volume: '',
												Depth: '',
												UlcerTemperature: '',
											})
										}
										className='bg-blue-50 text-blue-600 hover:bg-blue-100 rounded px-3 py-1 text-sm font-medium transition-colors'
									>
										+ Add Ulcer
									</button>
								</div>

								{fields.length === 0 && (
									<p className='text-gray-400 py-4 text-center text-sm italic'>
										No ulcers added. The patient will be created with an empty ulcer record.
									</p>
								)}

								{fields.map((field, index) => (
									<div
										key={field.id}
										className='bg-white border-gray-100 grid grid-cols-1 items-end gap-3 rounded-lg border p-4 shadow-sm md:grid-cols-6'
									>
										<div className='flex flex-col gap-1'>
											<label className='text-gray-400 text-[10px] font-bold uppercase'>
												Ulcer ID
											</label>
											<input
												{...register(`Ulcers.${index}.ulcerId`)}
												className='bg-gray-50 text-gray-400 rounded border p-2 text-xs'
												readOnly
											/>
										</div>
										<div className='flex flex-col gap-1'>
											<label className='text-gray-500 text-xs font-semibold'>Grade</label>
											<input
												{...register(`Ulcers.${index}.UlcerGrade`)}
												placeholder='1-6'
												className='bg-white rounded border p-2'
											/>
										</div>
										<div className='flex flex-col gap-1'>
											<label className='text-gray-500 text-xs font-semibold'>Volume (mm³)</label>
											<input
												{...register(`Ulcers.${index}.Volume`)}
												placeholder='0.00'
												className='bg-white rounded border p-2'
											/>
										</div>
										<div className='flex flex-col gap-1'>
											<label className='text-gray-500 text-xs font-semibold'>Depth (mm)</label>
											<input
												{...register(`Ulcers.${index}.Depth`)}
												placeholder='0.00'
												className='bg-white rounded border p-2'
											/>
										</div>
										<div className='flex flex-col gap-1'>
											<label className='text-gray-500 text-xs font-semibold'>Temp (°C)</label>
											<input
												{...register(`Ulcers.${index}.UlcerTemperature`)}
												placeholder='36.5'
												className='bg-white rounded border p-2'
											/>
										</div>
										<button
											type='button'
											onClick={() => remove(index)}
											className='text-red-500 hover:bg-red-50 mb-0.5 flex items-center justify-center rounded p-2'
										>
											<Trash2 className='h-5 w-5' />
										</button>
									</div>
								))}
							</div>

							<div className='flex justify-end gap-4 pt-6'>
								<button
									type='button'
									onClick={() => setIsOpen(false)}
									className='hover:bg-gray-50 rounded border px-6 py-2'
								>
									Cancel
								</button>
								<Button
									type='submit'
									variant='salmon'
									size='card'
									className='rounded-none px-8 py-4 text-lg font-normal'
								>
									Save Patient Record
									<Activity className='ml-2 h-5 w-5' />
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default CreateNewPatientButton;
