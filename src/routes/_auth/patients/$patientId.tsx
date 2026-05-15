import React, { useEffect, useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import DashboardHeader from '../../../shared/components/DashboardHeader';
import { MedicationsCard } from '../../../shared/components/InfoCards/MedicationsCard';
import { DiabetesSpecificsCard } from '../../../shared/components/InfoCards/DiabetesSpecificsCard';
import { NotesCard } from '../../../shared/components/InfoCards/NotesCard';
import { PersonalDetailsCard } from '../../../shared/components/InfoCards/PersonalDetailsCard';
import ScanCard from '../../../shared/components/InfoCards/ScanCard';
import ScanComparisonCard from '../../../shared/components/InfoCards/ScanComparisonCard';
import StatusPill from '../../../shared/components/StatusPill';

import UlcerMetrics from '../../../shared/components/UlcerStuff/UlcerMetrics';
import UlcerTabs from '../../../shared/components/UlcerStuff/UlcerTabs';
import UlcerProgressionChart from '../../../shared/components/Charts/UlcerProgressionChart';

import {
	ShieldAlert,
	AlertTriangle,
	ShieldCheck,
	TrendingDown,
	TrendingUp,
	Minus,
	ChevronLeft,
	Calendar,
	User,
	Activity,
	PlusCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SINBAD Risk Banner Logic
// ─────────────────────────────────────────────────────────────────────────────

type RiskLevel = 'HIGH' | 'MODERATE' | 'LOW' | null;

interface RiskBannerProps {
	annotations: any[];
	selectedUlcerId: string;
}

function getLatestGrade(annotations: any[], ulcerId: string) {
	const ulcerAnnotations = annotations
		.filter(a => a.ulcerId === ulcerId && a.grading?.totalGrade !== undefined)
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	if (ulcerAnnotations.length === 0) return null;
	return {
		grade: Number(ulcerAnnotations[0].grading.totalGrade),
		date: ulcerAnnotations[0].createdAt,
	};
}

function getRiskLevel(grade: number): RiskLevel {
	if (grade >= 4) return 'HIGH';
	if (grade >= 2) return 'MODERATE';
	return 'LOW';
}

function getGradeSlope(annotations: any[], ulcerId: string): number | null {
	const sorted = annotations
		.filter(a => a.ulcerId === ulcerId && a.grading?.totalGrade !== undefined && a.createdAt)
		.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

	if (sorted.length < 2) return null;
	const ys = sorted.map(a => Number(a.grading.totalGrade));
	const n = ys.length;
	const xMean = (n - 1) / 2;
	const yMean = ys.reduce((a, b) => a + b, 0) / n;
	let ssxy = 0,
		ssxx = 0;
	ys.forEach((y, x) => {
		ssxy += (x - xMean) * (y - yMean);
		ssxx += (x - xMean) ** 2;
	});
	return ssxx !== 0 ? ssxy / ssxx : 0;
}

const riskConfig = {
	HIGH: {
		bg: 'bg-red-50',
		border: 'border-red-200',
		text: 'text-red-800',
		badge: 'bg-red-600 text-white',
		icon: ShieldAlert,
		iconColour: 'text-red-600',
		message: 'Refer to multidisciplinary foot team — high amputation risk',
	},
	MODERATE: {
		bg: 'bg-amber-50',
		border: 'border-amber-200',
		text: 'text-amber-800',
		badge: 'bg-amber-500 text-white',
		icon: AlertTriangle,
		iconColour: 'text-amber-600',
		message: 'Active management required — increase monitoring frequency',
	},
	LOW: {
		bg: 'bg-emerald-50',
		border: 'border-emerald-200',
		text: 'text-emerald-800',
		badge: 'bg-emerald-600 text-white',
		icon: ShieldCheck,
		iconColour: 'text-emerald-600',
		message: 'Continue standard care plan — monitor for deterioration',
	},
};

const trendConfig = {
	healing: {
		label: 'Healing',
		Icon: TrendingDown,
		colour: 'text-emerald-600',
		bg: 'bg-emerald-100',
	},
	stable: { label: 'Stable', Icon: Minus, colour: 'text-amber-600', bg: 'bg-amber-100' },
	deteriorating: {
		label: 'Deteriorating',
		Icon: TrendingUp,
		colour: 'text-red-600',
		bg: 'bg-red-100',
	},
};

const RiskBanner: React.FC<RiskBannerProps> = ({ annotations, selectedUlcerId }) => {
	const latest = useMemo(
		() => getLatestGrade(annotations, selectedUlcerId),
		[annotations, selectedUlcerId],
	);
	const slope = useMemo(
		() => getGradeSlope(annotations, selectedUlcerId),
		[annotations, selectedUlcerId],
	);

	if (!latest) return null;
	const risk = getRiskLevel(latest.grade);
	const c = riskConfig[risk as keyof typeof riskConfig];
	const trend =
		slope === null ? null : slope > 0.15 ? 'deteriorating' : slope < -0.15 ? 'healing' : 'stable';
	const RiskIcon = c.icon;

	return (
		<div
			className={`flex flex-col items-center gap-6 rounded-3xl border-2 p-6 shadow-sm md:flex-row ${c.bg} ${c.border}`}
		>
			<div className={`bg-white rounded-2xl p-4 shadow-sm ${c.iconColour}`}>
				<RiskIcon size={32} strokeWidth={2.5} />
			</div>
			<div className='flex-1 text-center md:text-left'>
				<div className='mb-1 flex flex-wrap items-center justify-center gap-3 md:justify-start'>
					<span
						className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest ${c.badge}`}
					>
						{risk} RISK
					</span>
					<span className={`text-lg font-black ${c.text}`}>SINBAD Grade {latest.grade}/6</span>
					<span className='text-slate-500 flex items-center gap-1 text-xs font-medium'>
						<Calendar size={14} /> {new Date(latest.date).toLocaleDateString('en-GB')}
					</span>
				</div>
				<p className={`text-sm font-semibold opacity-90 ${c.text}`}>{c.message}</p>
			</div>

			{trend &&
				(() => {
					const t = trendConfig[trend];
					return (
						<div className='border-white/50 bg-white/80 flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm backdrop-blur-sm'>
							<t.Icon className={`h-5 w-5 ${t.colour}`} />
							<div className='flex flex-col leading-none'>
								<span className='text-slate-400 text-[10px] font-black uppercase'>Trend</span>
								<span className={`text-sm font-black ${t.colour}`}>{t.label}</span>
							</div>
						</div>
					);
				})()}
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Patient Details Component
// ─────────────────────────────────────────────────────────────────────────────

function PatientDetails() {
	const { patient: initialPatient, user, initialNotes, scans } = Route.useLoaderData();
	const [patient, setPatient] = useState(initialPatient);
	const [selectedUlcerId, setSelectedUlcerId] = useState('');
	const [annotations, setAnnotations] = useState<any[]>([]);
	const [ulcers, setUlcers] = useState<any[]>([]);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	useEffect(() => {
		if (!patient) return;
		const patientUlcers = patient.Ulcers || [];
		setUlcers(patientUlcers);
		if (patientUlcers.length > 0 && !selectedUlcerId) {
			setSelectedUlcerId(patientUlcers[0].ulcerId);
		}

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

	const handleStatusChange = async (newStatus: string) => {
		setIsUpdatingStatus(true);
		try {
			const res = await fetch(`http://localhost:3000/patients/${patient._id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					personalDetails: { ...patient['Personal Details'], Status: newStatus },
				}),
			});
			if (res.ok) {
				const updatedPatient = await res.json();
				setPatient(updatedPatient);
			}
		} catch (err) {
			console.error('Failed to update status', err);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const filteredScans = useMemo(() => {
		return [...scans]
			.filter(s => s.ulcerId === selectedUlcerId)
			.sort((a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime());
	}, [scans, selectedUlcerId]);

	const annotatedScanIds = useMemo(() => new Set(annotations.map(a => a.scanId)), [annotations]);
	const comparableScans = useMemo(
		() => filteredScans.filter(s => annotatedScanIds.has(s._id)),
		[filteredScans, annotatedScanIds],
	);

	return (
		<div className='flex min-h-screen flex-col bg-[#F8FAFC] font-sans antialiased'>
			<DashboardHeader activeView={1} setActiveView={() => {}} user={user} />

			{/* Main Container - 90% width keeps a nice 5% margin on both sides */}
			<main className='mx-auto w-[90%] flex-1 py-8'>
				{/* HEADER SECTION */}
				<div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
					<div className='flex items-center gap-6'>
						<div className='bg-blue-600 shadow-blue-100 text-white rounded-3xl p-4 shadow-xl'>
							<User size={36} />
						</div>
						<div>
							<div className='flex items-center gap-3'>
								<h1 className='text-slate-900 text-4xl font-black tracking-tight'>
									{patient?.['Personal Details']?.FName} {patient?.['Personal Details']?.Lname}
								</h1>
								<StatusPill status={patient?.['Personal Details']?.Status || 'New'} />
							</div>
							<div className='mt-2 flex items-center gap-4'>
								<Link
									to='/TEMP_table_test'
									className='text-teal-600 hover:text-teal-700 flex items-center gap-1.5 text-sm font-bold transition-colors'
								>
									<ChevronLeft size={16} /> Back to Patient Registry
								</Link>
								<span className='text-slate-300'>|</span>
								<span className='bg-slate-200/50 text-slate-600 rounded-lg px-2.5 py-1 font-mono text-xs font-bold'>
									ID: {patient?.PatientId}
								</span>
								<span className='text-slate-500 text-sm font-bold'>
									DOB:{' '}
									{patient?.['Personal Details']?.DateOfBirth
										? new Date(patient['Personal Details'].DateOfBirth).toLocaleDateString('en-GB')
										: 'N/A'}
								</span>
							</div>
						</div>
					</div>

					<div className='flex flex-col items-end gap-3'>
						<span className='text-slate-400 mr-1 text-xs font-bold uppercase tracking-wider'>
							Patient Status
						</span>
						<div className='group relative origin-right scale-125 transition-transform hover:scale-[1.3]'>
							<select
								value={patient?.['Personal Details']?.Status || 'New'}
								onChange={e => handleStatusChange(e.target.value)}
								disabled={isUpdatingStatus}
								className='absolute inset-0 z-10 w-full cursor-pointer opacity-0'
							>
								<option value='New'>New</option>
								<option value='Active'>Active</option>
								<option value='Urgent'>Urgent</option>
								<option value='Under Review'>Under Review (Warning)</option>
								<option value='Discharged'>Discharged (Inactive)</option>
							</select>
							<div
								className={`${isUpdatingStatus ? 'animate-pulse opacity-50' : ''} rounded-full shadow-sm`}
							>
								<StatusPill status={patient?.['Personal Details']?.Status || 'New'} />
							</div>
						</div>
						{isUpdatingStatus && (
							<span className='text-teal-600 mt-1 animate-pulse text-[10px] font-bold'>
								SAVING TO DATABASE...
							</span>
						)}
					</div>
				</div>

				{/* CONTENT GRID */}
				<div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
					{/* LEFT COLUMN (8/12) */}
					<div className='space-y-8 lg:col-span-8'>
						{selectedUlcerId && (
							<RiskBanner annotations={annotations} selectedUlcerId={selectedUlcerId} />
						)}

						<section className='overflow-hidden rounded-[2.5rem] bg-white-primary  shadow-sm'>
							<UlcerTabs
								ulcers={ulcers}
								selectedUlcerId={selectedUlcerId}
								onSelect={setSelectedUlcerId}
								patientId={patient._id}
							/>
							<div className='p-8'>
								<UlcerMetrics
									scans={scans}
									annotations={annotations}
									selectedUlcerId={selectedUlcerId}
								/>
							</div>
						</section>

						<div className='grid grid-cols-1 gap-8 xl:grid-cols-2'>
							<ScanCard
								key={selectedUlcerId}
								patientId={patient._id}
								scans={filteredScans}
								annotations={annotations}
								selectedUlcerId={selectedUlcerId}
							/>

							<div className='border-slate-200 bg-white flex flex-col rounded-[2.5rem] p-8 shadow-sm'>
								<div className='mb-8 flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Activity className='text-blue-600' size={20} />
										<h3 className='text-slate-400 text-sm font-black uppercase tracking-widest'>
											Growth & Grading Trends
										</h3>
									</div>
								</div>
								<div className='min-h-[350px] w-full flex-1'>
									<UlcerProgressionChart
										annotations={annotations}
										selectedUlcerId={selectedUlcerId}
									/>
								</div>
							</div>
						</div>

						{comparableScans.length >= 1 && (
							<ScanComparisonCard
								scans={filteredScans}
								patientId={patient._id}
								selectedUlcerId={selectedUlcerId}
							/>
						)}
					</div>

					{/* RIGHT COLUMN (4/12) */}
					<div className='space-y-6 lg:col-span-4'>
						<div className='sticky top-8 space-y-6'>
							<PersonalDetailsCard patient={patient} />
							<DiabetesSpecificsCard patient={patient} />
							<MedicationsCard patient={patient} />
							<NotesCard patientId={patient._id} initialNotes={initialNotes} />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

export const Route = createFileRoute('/_auth/patients/$patientId')({
	loader: async ({ params, context }) => {
		const patientId = params.patientId;
		try {
			const [pRes, nRes, sRes] = await Promise.all([
				fetch(`http://localhost:3000/patients/${patientId}`),
				fetch(`http://localhost:3000/notes/${patientId}`),
				fetch(`http://localhost:3000/scans/patient/${patientId}`),
			]);
			const patient = await pRes.json();
			const notes = nRes.ok ? await nRes.json() : [];
			const scans = sRes.ok ? await sRes.json() : [];
			return {
				user: context.user,
				patient,
				initialNotes: notes.length
					? notes
					: [
							{
								_id: '1',
								content: 'No notes.',
								date: new Date().toISOString(),
								isPlaceholder: true,
							},
						],
				scans,
			};
		} catch (e) {
			return { user: context.user, patient: null, initialNotes: [], scans: [] };
		}
	},
	component: PatientDetails,
});
