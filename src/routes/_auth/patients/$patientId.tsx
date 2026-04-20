import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import DashboardHeader from '../../../shared/components/DashboardHeader';
import { MedicationsCard } from '../../../shared/components/InfoCards/MedicationsCard';
import { DiabetesSpecificsCard } from '../../../shared/components/InfoCards/DiabetesSpecificsCard';
import { NotesCard } from '../../../shared/components/InfoCards/NotesCard';
import { PersonalDetailsCard } from '../../../shared/components/InfoCards/PersonalDetailsCard';
import ScanCard from '../../../shared/components/InfoCards/ScanCard';

import UlcerMetrics from '../../../shared/components/UlcerStuff/UlcerMetrics';
import UlcerTabs from '../../../shared/components/UlcerStuff/UlcerTabs';

import UlcerProgressionChart from '../../../shared/components/Charts/UlcerProgressionChart';

function PatientDetails() {
	const { patient, user, initialNotes, scans } = Route.useLoaderData();

	const [selectedUlcerId, setSelectedUlcerId] = useState('');
	const [annotations, setAnnotations] = useState<any[]>([]);
	const [ulcers, setUlcers] = useState<any[]>([]);

	// 🔥 LOAD ulcers + annotations
	useEffect(() => {
		if (!patient) return;

		// ✅ ulcers come from patient directly
		const patientUlcers = patient.Ulcers || [];
		setUlcers(patientUlcers);

		// ✅ set default selected ulcer
		if (patientUlcers.length > 0) {
			setSelectedUlcerId(patientUlcers[0].ulcerId);
		}

		// ✅ fetch annotations for this patient
		const fetchAnnotations = async () => {
			try {
				const res = await fetch(`http://localhost:3000/annotations/patient/${patient._id}`);
				const data = await res.json();
				setAnnotations(data || []);
			} catch (err) {
				console.error('Failed to fetch annotations', err);
			}
		};

		fetchAnnotations();
	}, [patient]);

	const filteredScans = useMemo(() => {
		// Just return all scans for this patient, sorted by date
		return [...scans].sort(
			(a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime(),
		);
	}, [scans]);

	console.log('Current Ulcer:', selectedUlcerId, 'Scans found:', filteredScans.length);
	return (
		<div className='flex min-h-screen flex-col'>
			<DashboardHeader activeView={1} setActiveView={() => {}} user={user} />

			<div className='flex-1 bg-[#EBF1F2]'>
				<main className='px-6 py-10 lg:px-20 xl:px-32'>
					{/* 🔹 HEADER */}
					<div className='mb-10 flex items-center justify-between'>
						<div>
							<h1 className='text-slate-800 text-3xl font-semibold'>
								{patient?.['Personal Details']?.Name}
							</h1>
							<p className='text-slate-500 text-sm'>ICD #: {patient?.PatientId}</p>

							<Link to='/TEMP_table_test' className='mt-1 block w-fit'>
								<p className='text-gray-500 hover:text-teal-600 cursor-pointer text-sm transition-colors'>
									← Back to patients list
								</p>
							</Link>
						</div>
					</div>

					{/* 🔹 ROW 1 — TOP CARDS */}
					<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
						<PersonalDetailsCard patient={patient} />
						<DiabetesSpecificsCard patient={patient} />

						<div className='bg-white rounded-xl p-6 shadow-sm'>
							<p className='text-slate-500 text-sm'>Foot Diagram (TODO)</p>
						</div>
					</div>

					{/* 🔴 ROW 2 — REAL ULCER TABS */}
					<UlcerTabs
						ulcers={ulcers}
						selectedUlcerId={selectedUlcerId}
						onSelect={setSelectedUlcerId}
					/>

					{/* 🔵 ROW 3 — REAL METRICS */}
					<UlcerMetrics scans={scans} annotations={annotations} selectedUlcerId={selectedUlcerId} />

					{/* 🔹 ROW 4 — MAIN CONTENT */}
					<div className='mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2'>
						<ScanCard
							key={selectedUlcerId}
							patientId={patient._id}
							scans={filteredScans}
							annotations={annotations}
							selectedUlcerId={selectedUlcerId} // 👈 Add this line
						/>
						<div className='bg-white rounded-xl p-8 shadow-sm'>
							<UlcerProgressionChart annotations={annotations} selectedUlcerId={selectedUlcerId} />
						</div>
					</div>

					{/* 🔹 ROW 5 — LOWER CARDS */}
					<div className='mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3'>
						<MedicationsCard patient={patient} />
						<NotesCard patientId={patient._id} initialNotes={initialNotes} />

						<div className='bg-white rounded-xl p-6 shadow-sm'>
							<p className='text-slate-400'>Extra panel (optional)</p>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/_auth/patients/$patientId')({
	loader: async ({ params, context }) => {
		const patientId = params.patientId;

		try {
			const [patientRes, notesRes, scansRes] = await Promise.all([
				fetch(`http://localhost:3000/patients/${patientId}`),
				fetch(`http://localhost:3000/notes/${patientId}`),
				fetch(`http://localhost:3000/scans/patient/${patientId}`),
			]);

			if (!patientRes.ok) throw new Error('Failed to fetch patient');

			const patient = await patientRes.json();

			let notes = notesRes.ok ? await notesRes.json() : [];

			if (notes.length === 0) {
				notes = [
					{
						_id: 'placeholder',
						content: 'No notes found for this patient.',
						date: new Date().toISOString(),
						isPlaceholder: true,
					},
				];
			}

			const scans = scansRes.ok ? await scansRes.json() : [];

			return {
				user: context.user,
				patient,
				initialNotes: notes,
				scans,
			};
		} catch (error) {
			console.error('Loader error:', error);

			return {
				user: context.user,
				patient: null,
				initialNotes: [
					{
						_id: 'error-placeholder',
						content: 'No notes found for this patient.',
						date: new Date().toISOString(),
						isPlaceholder: true,
					},
				],
				scans: [],
			};
		}
	},
	component: PatientDetails,
});
