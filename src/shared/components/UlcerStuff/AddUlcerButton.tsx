import React, { useState } from 'react';
import { Upload, X, FileUp, Activity, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../Button';

interface Props {
	patientId: string;
}

const SERVER_URL = 'http://localhost:3000';

const AddUlcerButton: React.FC<Props> = ({ patientId }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			patientComments: 'Initial scan',
			glucoseLiveReadings: 8.5,
		},
	});

	const onSubmit = async (data: any) => {
		setIsUploading(true);
		try {
			const ulcerId = `ULC-${Date.now()}`;

			// 1 — Create ulcer on patient
			const ulcerRes = await fetch(`${SERVER_URL}/patients/${patientId}/ulcer`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ulcerId,
					ulcerData: {
						ulcerId,
						NumberOfScans: 1,
						UlcerGrade: '0',
					},
				}),
			});

			if (!ulcerRes.ok) throw new Error('Failed to create ulcer');

			// 2 — Upload scan files
			const formData = new FormData();
			formData.append('patientId', patientId);
			formData.append('ulcerId', ulcerId);
			formData.append('createdBy', 'SHAH');
			formData.append('patientComments', data.patientComments);
			formData.append('glucoseLiveReadings', data.glucoseLiveReadings);
			if (data.plyFile?.[0]) formData.append('ply', data.plyFile[0]);
			if (data.rgbFile?.[0]) formData.append('rgb', data.rgbFile[0]);
			if (data.depthFile?.[0]) formData.append('rgbd', data.depthFile[0]);

			const scanRes = await fetch(`${SERVER_URL}/scans`, {
				method: 'POST',
				body: formData,
			});

			if (!scanRes.ok) throw new Error('Failed to upload scan');
			const { scan } = await scanRes.json();

			// 3 — Create blank annotation
			const annotationRes = await fetch(`${SERVER_URL}/annotations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scanId: scan._id,
					patientId,
					ulcerId,
					points: [],
					measurements: null,
					grading: null,
				}),
			});

			if (!annotationRes.ok) throw new Error('Failed to create annotation');

			alert('New ulcer created successfully!');
			setIsOpen(false);
			reset();
			window.location.reload();
		} catch (err: any) {
			console.error(err);
			alert(`Error: ${err.message}`);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='bg-gray-200 text-slate-600 hover:bg-gray-300 rounded-lg px-5 py-2 font-semibold transition'
			>
				+
			</button>

			{isOpen && (
				<div className='bg-black/50 fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-sm'>
					<div className='w-full max-w-2xl overflow-y-auto rounded-xl bg-white-primary p-8 shadow-2xl'>
						<div className='mb-6 flex items-center justify-between border-b pb-4'>
							<div>
								<h2 className='text-gray-800 text-2xl font-bold'>New Ulcer</h2>
								<p className='text-gray-500 font-mono text-xs'>Patient: {patientId}</p>
							</div>
							<button onClick={() => setIsOpen(false)} className='text-gray-500 hover:text-black'>
								<X className='h-6 w-6' />
							</button>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
							<div className='bg-gray-50 border-gray-100 space-y-4 rounded-lg border p-4'>
								<h3 className='text-gray-700 flex items-center gap-2 text-sm font-bold'>
									<FileUp className='h-4 w-4' /> Initial Scan Files
								</h3>

								<div>
									<label className='text-gray-400 block text-[10px] font-bold uppercase'>
										PLY Mesh (.ply)
									</label>
									<input
										type='file'
										accept='.ply'
										{...register('plyFile', { required: true })}
										className='text-gray-500 file:bg-salmon/10 file:text-salmon mt-1 block w-full text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2'
									/>
								</div>

								<div>
									<label className='text-gray-400 block text-[10px] font-bold uppercase'>
										RGB Data (.rgb8)
									</label>
									<input
										type='file'
										accept='.rgb8'
										{...register('rgbFile', { required: true })}
										className='text-gray-500 file:bg-blue-50 file:text-blue-600 mt-1 block w-full text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2'
									/>
								</div>

								<div>
									<label className='text-gray-400 block text-[10px] font-bold uppercase'>
										Depth Data (.depth16)
									</label>
									<input
										type='file'
										accept='.depth16'
										{...register('depthFile', { required: true })}
										className='text-gray-500 file:bg-emerald-50 file:text-emerald-600 mt-1 block w-full text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2'
									/>
								</div>
							</div>

							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='flex flex-col gap-1'>
									<label className='text-gray-500 flex items-center gap-1 text-xs font-semibold'>
										<Activity className='h-3 w-3' /> Glucose Reading (mmol/L)
									</label>
									<input
										type='number'
										step='0.1'
										{...register('glucoseLiveReadings')}
										className='focus:ring-salmon/50 rounded border p-2 outline-none focus:ring-2'
									/>
								</div>

								<div className='flex flex-col gap-1'>
									<label className='text-gray-500 flex items-center gap-1 text-xs font-semibold'>
										<MessageSquare className='h-3 w-3' /> Comments
									</label>
									<input
										{...register('patientComments')}
										className='focus:ring-salmon/50 rounded border p-2 outline-none focus:ring-2'
									/>
								</div>
							</div>

							<div className='flex justify-end gap-4 pt-4'>
								<button
									type='button'
									onClick={() => setIsOpen(false)}
									className='text-gray-600 hover:bg-gray-50 px-6 py-2'
									disabled={isUploading}
								>
									Cancel
								</button>
								<Button
									type='submit'
									variant='salmon'
									className='rounded-none px-10 py-4 disabled:opacity-50'
									disabled={isUploading}
								>
									{isUploading ? 'Creating...' : 'Create Ulcer'}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default AddUlcerButton;
