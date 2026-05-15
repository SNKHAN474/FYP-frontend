import React, { useState, useEffect } from 'react';
import { Plus, X, Activity, Scale, Ruler, ClipboardList } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from './Button';

type Tab = 'Personal' | 'Contact' | 'Diabetes' | 'History';

const TABS: Tab[] = ['Personal', 'Contact', 'Diabetes', 'History'];

const inputClass =
	'w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600';
const labelClass = 'mb-1 block text-xs font-medium text-gray-600';

const generatePatientId = (firstName: string, lastName: string, dob: string) => {
	const randomStr = Math.random().toString(16).substring(2, 6).toUpperCase();
	const year = dob ? dob.split('-')[0] : new Date().getFullYear();
	const initials = (lastName || firstName || 'XX').substring(0, 2).toUpperCase();
	return `PAT-${initials}${year}-${randomStr}`;
};

const CreateNewPatientButton = ({ clinicianId }: { clinicianId: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>('Personal');

	const { register, handleSubmit, control, reset, setValue } = useForm({
		defaultValues: {
			ClinicianId: clinicianId,
			PatientId: '',
			Name: '', // Full Name (Last, First) for the top-level schema
			UserNumber: '',
			'Personal Details': {
				FName: '', // Maps to schema FName
				Lname: '', // Maps to schema Lname
				DateOfBirth: '',
				Status: 'New',
				Gender: 'Other',
				Height: '',
				Weight: '',
				TreatmentStartDate: new Date().toISOString().split('T')[0],
				ContactDetails: {
					Phone: '',
					EmailAddress: '',
					Address: { Street: '', City: '', Postcode: '', County: '' },
				},
			},
			DiabetesInfo: {
				DiabetesType: 1,
				PreviousAmputation: false,
				YearsDiagnosed: '',
				Medication: false,
				MedicationsInfo: '',
				OtherDMOrCVComplications: '',
				LatestBP: '',
				LastHb1AcReading: '',
				LastHb1AcReadingDate: '',
			},
			MedicalHistory: '',
		},
	});

	// Sync clinicianId if it changes
	useEffect(() => {
		setValue('ClinicianId', clinicianId);
	}, [clinicianId, setValue]);

	const isOnMedication = useWatch({ control, name: 'DiabetesInfo.Medication' });

	const onSubmit = async (data: any) => {
		try {
			const pDetails = data['Personal Details'];

			// 1. Generate the unique GDPR ID
			const generatedId = generatePatientId(pDetails.FName, pDetails.Lname, pDetails.DateOfBirth);

			// 2. Format data to match Mongoose Schema exactly
			let formattedData = { ...data };
			formattedData.PatientId = generatedId;

			// Combine names for the top-level 'Name' field used in tables
			formattedData.Name = `${pDetails.Lname}, ${pDetails.FName}`;

			// Ensure the nested PatientId matches
			formattedData['Personal Details'].PatientId = generatedId;

			// 3. POST to backend (Using ClinicianId for isolation)
			const response = await fetch('http://localhost:3000/patients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formattedData),
			});

			if (response.ok) {
				alert(`Patient Created: ${generatedId}`);
				setIsOpen(false);
				reset();
			}
		} catch (error) {
			console.error('Failed to create patient:', error);
		}
	};

	return (
		<>
			<Button variant='salmon' size='card' className='ml-auto' onClick={() => setIsOpen(true)}>
				Create New Patient <Plus className='ml-2 h-5 w-5' />
			</Button>

			{isOpen && (
				<div className='bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
					<div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white-primary shadow-2xl'>
						{/* Header */}
						<div className='flex items-center justify-between border-b px-6 py-4'>
							<h2 className='text-gray-800 text-xl font-bold'>Patient Intake Form</h2>
							<button onClick={() => setIsOpen(false)}>
								<X className='text-gray-400 hover:text-gray-600 h-6 w-6' />
							</button>
						</div>

						{/* Navigation */}
						<div className='flex gap-1 border-b px-6 pt-4'>
							{TABS.map(tab => (
								<button
									key={tab}
									type='button'
									onClick={() => setActiveTab(tab)}
									className={`px-4 py-2 text-sm font-medium transition-colors ${
										activeTab === tab
											? 'border-teal-600 text-teal-600 border-b-2'
											: 'text-gray-400 hover:text-gray-600'
									}`}
								>
									{tab}
								</button>
							))}
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className='p-6'>
							{/* --- PERSONAL TAB --- */}
							{activeTab === 'Personal' && (
								<div className='space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className={labelClass}>First Name (Required)</label>
											<input
												{...register('Personal Details.FName')}
												className={inputClass}
												placeholder='John'
												required
											/>
										</div>
										<div>
											<label className={labelClass}>Last Name (Required)</label>
											<input
												{...register('Personal Details.Lname')}
												className={inputClass}
												placeholder='Smith'
												required
											/>
										</div>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className={labelClass}>DOB (Required)</label>
											<input
												{...register('Personal Details.DateOfBirth')}
												type='date'
												className={inputClass}
												required
											/>
										</div>
										<div>
											<label className={labelClass}>Gender</label>
											<select {...register('Personal Details.Gender')} className={inputClass}>
												<option value='Male'>Male</option>
												<option value='Female'>Female</option>
												<option value='Other'>Other</option>
											</select>
										</div>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div className='relative'>
											<label className={labelClass}>Height (cm)</label>
											<Ruler className='text-gray-400 absolute right-3 top-8 h-4 w-4' />
											<input
												{...register('Personal Details.Height')}
												className={inputClass}
												placeholder='175'
											/>
										</div>
										<div className='relative'>
											<label className={labelClass}>Weight (kg)</label>
											<Scale className='text-gray-400 absolute right-3 top-8 h-4 w-4' />
											<input
												{...register('Personal Details.Weight')}
												className={inputClass}
												placeholder='70'
											/>
										</div>
									</div>
								</div>
							)}

							{/* --- CONTACT TAB --- */}
							{activeTab === 'Contact' && (
								<div className='space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className={labelClass}>Phone</label>
											<input
												{...register('Personal Details.ContactDetails.Phone')}
												className={inputClass}
											/>
										</div>
										<div>
											<label className={labelClass}>Email</label>
											<input
												{...register('Personal Details.ContactDetails.EmailAddress')}
												className={inputClass}
											/>
										</div>
									</div>
									<div className='space-y-3 pt-2'>
										<p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest'>
											Mailing Address
										</p>
										<input
											{...register('Personal Details.ContactDetails.Address.Street')}
											placeholder='Street'
											className={inputClass}
										/>
										<div className='grid grid-cols-3 gap-2'>
											<input
												{...register('Personal Details.ContactDetails.Address.City')}
												placeholder='City'
												className={inputClass}
											/>
											<input
												{...register('Personal Details.ContactDetails.Address.County')}
												placeholder='County'
												className={inputClass}
											/>
											<input
												{...register('Personal Details.ContactDetails.Address.Postcode')}
												placeholder='Postcode'
												className={inputClass}
											/>
										</div>
									</div>
								</div>
							)}

							{/* --- DIABETES TAB --- */}
							{activeTab === 'Diabetes' && (
								<div className='space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className={labelClass}>Diabetes Type</label>
											<select {...register('DiabetesInfo.DiabetesType')} className={inputClass}>
												<option value={1}>Type 1</option>
												<option value={2}>Type 2</option>
											</select>
										</div>
										<div>
											<label className={labelClass}>Years Diagnosed</label>
											<input {...register('DiabetesInfo.YearsDiagnosed')} className={inputClass} />
										</div>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className={labelClass}>Latest BP</label>
											<input
												{...register('DiabetesInfo.LatestBP')}
												placeholder='120/80'
												className={inputClass}
											/>
										</div>
										<div>
											<label className={labelClass}>Last HbA1c</label>
											<input
												{...register('DiabetesInfo.LastHb1AcReading')}
												placeholder='7.5%'
												className={inputClass}
											/>
										</div>
									</div>
									<div className='bg-gray-50 flex items-center gap-4 rounded p-3'>
										<label className='text-teal-700 flex cursor-pointer items-center gap-2 text-xs font-bold'>
											<input
												type='checkbox'
												{...register('DiabetesInfo.Medication')}
												className='accent-teal-600'
											/>
											On Medication
										</label>
										<label className='text-red-700 flex cursor-pointer items-center gap-2 text-xs font-bold'>
											<input
												type='checkbox'
												{...register('DiabetesInfo.PreviousAmputation')}
												className='accent-red-600'
											/>
											Prev. Amputation
										</label>
									</div>
									{isOnMedication && (
										<textarea
											{...register('DiabetesInfo.MedicationsInfo')}
											placeholder='Medication list...'
											className={`${inputClass} min-h-[80px]`}
										/>
									)}
								</div>
							)}

							{/* --- HISTORY TAB --- */}
							{activeTab === 'History' && (
								<div className='space-y-4'>
									<div>
										<label className={labelClass}>Internal User Number</label>
										<input
											{...register('UserNumber')}
											placeholder='NHS or Hospital ID'
											className={inputClass}
										/>
									</div>
									<div>
										<label className={labelClass}>General Medical History</label>
										<textarea
											{...register('MedicalHistory')}
											className={`${inputClass} min-h-[150px]`}
											placeholder='Note any other relevant conditions...'
										/>
									</div>
									<div className='bg-teal-50 border-teal-100 flex gap-3 rounded border p-3'>
										<ClipboardList className='text-teal-600 h-5 w-5 shrink-0' />
										<p className='text-teal-800 text-[11px]'>
											<b>Note:</b> Ulcer specific data and Foot Graph coordinates are added via the{' '}
											<b>Patient Dashboard</b> after the initial profile is created.
										</p>
									</div>
								</div>
							)}

							{/* Footer */}
							<div className='mt-8 flex justify-end gap-3'>
								{activeTab !== 'History' ? (
									<button
										type='button'
										onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) + 1])}
										className='bg-teal-700 text-white hover:bg-teal-800 rounded px-6 py-2 text-sm font-bold transition-colors'
									>
										Next
									</button>
								) : (
									<Button type='submit' variant='salmon'>
										Create Patient <Activity className='ml-2 h-4 w-4' />
									</Button>
								)}
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default CreateNewPatientButton;
