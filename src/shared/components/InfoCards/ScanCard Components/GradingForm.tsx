import React, { useState, useEffect } from 'react';
import {
	CheckCircle2,
	Loader2,
	AlertTriangle,
	ShieldAlert,
	ShieldCheck,
	Activity,
	MessageSquare,
} from 'lucide-react';

interface GradingFormProps {
	patientId: string;
	ulcerId: string;
	result: {
		area: number;
		ulcerDepth: number;
		temperature?: number | null;
	};
	onSave: (
		manualScores: any,
		totalGrade: number,
		nextVisit: string,
		ulcerId: string,
		glucoseReading: string, // Added
		comments: string, // Added
	) => Promise<void>;
	onCancel: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// SINBAD Risk Stratification
// Grounded in: NICE NG19 (2019) — risk stratification for diabetic foot care;
// Oyibo et al. (2001) — SINBAD scoring validation.
// ─────────────────────────────────────────────────────────────────────────────
interface RiskProfile {
	level: 'LOW' | 'MODERATE' | 'HIGH';
	colour: 'emerald' | 'amber' | 'red';
	message: string;
	flags: string[];
	recommendedInterval: string;
}

function getRiskProfile(
	grade: number,
	scores: { site: number; ischemia: number; neuropathy: number; bacterialInfection: number },
	depth: number,
	area: number,
	temperatureC?: number | null,
): RiskProfile {
	const flags: string[] = [];

	if (scores.ischemia === 1)
		flags.push('Vascular compromise detected — perfusion assessment advised');
	if (scores.neuropathy === 1) flags.push('Peripheral neuropathy present — offloading required');
	if (scores.bacterialInfection === 1)
		flags.push('Active infection — urgent microbiological review');
	if (depth > 10) flags.push('Deep wound (>10 mm) — bone/tendon involvement risk');
	if (area >= 100) flags.push('Large surface area (≥100 mm²) — impaired closure likelihood');
	if (temperatureC !== null && temperatureC !== undefined && temperatureC > 37.5)
		flags.push(
			`Elevated perilesional temperature (${temperatureC.toFixed(1)}°C) — possible inflammatory response`,
		);

	if (grade >= 4) {
		return {
			level: 'HIGH',
			colour: 'red',
			message: 'Refer to multidisciplinary foot team — high amputation risk',
			flags,
			recommendedInterval: '3–7 days',
		};
	}
	if (grade >= 2) {
		return {
			level: 'MODERATE',
			colour: 'amber',
			message: 'Increase monitoring frequency — active management required',
			flags,
			recommendedInterval: '1–2 weeks',
		};
	}
	return {
		level: 'LOW',
		colour: 'emerald',
		message: 'Continue standard care plan — monitor for deterioration',
		flags,
		recommendedInterval: '4 weeks',
	};
}

const riskColours = {
	emerald: {
		bg: 'bg-emerald-50',
		border: 'border-emerald-200',
		badge: 'bg-emerald-100 text-emerald-800',
		icon: 'text-emerald-600',
		bar: 'bg-emerald-500',
	},
	amber: {
		bg: 'bg-amber-50',
		border: 'border-amber-200',
		badge: 'bg-amber-100 text-amber-800',
		icon: 'text-amber-600',
		bar: 'bg-amber-500',
	},
	red: {
		bg: 'bg-red-50',
		border: 'border-red-200',
		badge: 'bg-red-100 text-red-800',
		icon: 'text-red-600',
		bar: 'bg-red-500',
	},
};

const SINBAD_LABELS: Record<string, string> = {
	site: 'Site (forefoot = 0, mid/hindfoot = 1)',
	ischemia: 'Ischemia',
	neuropathy: 'Neuropathy',
	bacterialInfection: 'Bacterial Infection',
};

// ─────────────────────────────────────────────────────────────────────────────

const GradingForm: React.FC<GradingFormProps> = ({
	patientId,
	ulcerId,
	result,
	onSave,
	onCancel,
}) => {
	const [manualScores, setManualScores] = useState({
		site: 0,
		ischemia: 0,
		neuropathy: 0,
		bacterialInfection: 0,
	});

	const [isSaving, setIsSaving] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [glucoseReading, setGlucoseReading] = useState('5.5');
	const [comments, setComments] = useState('');

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

	const risk = getRiskProfile(
		totalGrade,
		manualScores,
		result.ulcerDepth,
		result.area,
		result.temperature,
	);
	const c = riskColours[risk.colour];

	const handleConfirm = async () => {
		setIsSaving(true);
		try {
			await onSave(manualScores, totalGrade, nextVisit, ulcerId, glucoseReading, comments);
			setIsSuccess(true);
			setTimeout(() => window.location.reload(), 1500);
		} catch (error) {
			console.error('Save failed:', error);
			alert('Failed to save record. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	// Auto-set recommended next-visit interval based on risk
	useEffect(() => {
		if (risk.level === 'HIGH') {
			const d = new Date();
			d.setDate(d.getDate() + 5);
			setNextVisit(d.toISOString().split('T')[0]);
		} else if (risk.level === 'MODERATE') {
			const d = new Date();
			d.setDate(d.getDate() + 10);
			setNextVisit(d.toISOString().split('T')[0]);
		} else {
			const d = new Date();
			d.setDate(d.getDate() + 28);
			setNextVisit(d.toISOString().split('T')[0]);
		}
	}, [risk.level]);

	if (isSuccess) {
		return (
			<div className='bg-slate-900/40 absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
				<div className='flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-white-primary p-8 text-center shadow-2xl'>
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
			<div className='border-slate-200 max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white-primary p-6 shadow-2xl'>
				{/* Header */}
				<div className='mb-5'>
					<h3 className='text-slate-800 text-xl font-bold'>Clinical Assessment</h3>
					<p className='text-slate-500 text-sm'>SINBAD Grading · Risk Stratification</p>
				</div>

				{/* Auto-scored metrics (read-only) */}
				<div className='bg-slate-50 mb-4 rounded-xl p-4'>
					<p className='text-slate-400 mb-2 text-[10px] font-bold uppercase tracking-widest'>
						Auto-scored from measurements
					</p>
					<div className='grid grid-cols-2 gap-2'>
						<div className='bg-white flex items-center justify-between rounded-lg px-3 py-2 shadow-sm'>
							<span className='text-slate-600 text-xs font-medium'>Area ≥100 mm²</span>
							<span
								className={`text-xs font-black ${areaScore ? 'text-red-600' : 'text-emerald-600'}`}
							>
								{areaScore ? '1 ✗' : '0 ✓'}
							</span>
						</div>
						<div className='bg-white flex items-center justify-between rounded-lg px-3 py-2 shadow-sm'>
							<span className='text-slate-600 text-xs font-medium'>Depth &gt;10 mm</span>
							<span
								className={`text-xs font-black ${depthScore ? 'text-red-600' : 'text-emerald-600'}`}
							>
								{depthScore ? '1 ✗' : '0 ✓'}
							</span>
						</div>
					</div>
				</div>

				{/* Manual SINBAD scores */}
				<div className='mb-4 space-y-2'>
					<p className='text-slate-400 text-[10px] font-bold uppercase tracking-widest'>
						Clinician assessment
					</p>
					{(Object.keys(manualScores) as (keyof typeof manualScores)[]).map(key => (
						<div
							key={key}
							className='border-slate-100 bg-slate-50 flex items-center justify-between rounded-xl border p-3'
						>
							<span className='text-slate-700 text-sm font-semibold'>
								{SINBAD_LABELS[key] ?? key}
							</span>
							<select
								className='border-slate-200 rounded border px-2 py-1 text-sm font-bold'
								value={manualScores[key]}
								onChange={e =>
									setManualScores(prev => ({ ...prev, [key]: parseInt(e.target.value) }))
								}
								disabled={isSaving}
							>
								<option value={0}>0 — Absent</option>
								<option value={1}>1 — Present</option>
							</select>
						</div>
					))}
				</div>

				{/* Vital Signs & Readings */}
				<div className='mb-4 space-y-3'>
					<p className='text-slate-400 text-[10px] font-bold uppercase tracking-widest'>
						Live Vitals & Observations
					</p>
					<div className='border-slate-100 bg-slate-50 rounded-xl border p-3'>
						<label className='text-slate-700 mb-1.5 flex items-center gap-2 text-sm font-semibold'>
							<Activity className='text-blue-500 h-4 w-4' />
							Glucose Reading (mmol/L)
						</label>
						<input
							type='number'
							step='0.1'
							className='border-slate-200 focus:ring-blue-500 w-full rounded-lg border p-2 text-sm font-bold outline-none focus:ring-2'
							value={glucoseReading}
							onChange={e => setGlucoseReading(e.target.value)}
							disabled={isSaving}
						/>
					</div>

					<div className='border-slate-100 bg-slate-50 rounded-xl border p-3'>
						<label className='text-slate-700 mb-1.5 flex items-center gap-2 text-sm font-semibold'>
							<MessageSquare className='text-blue-500 h-4 w-4' />
							Clinician Comments
						</label>
						<textarea
							className='border-slate-200 focus:ring-blue-500 min-h-[80px] w-full rounded-lg border p-2 text-sm outline-none focus:ring-2'
							placeholder='Add clinical notes, dressing type, or observations...'
							value={comments}
							onChange={e => setComments(e.target.value)}
							disabled={isSaving}
						/>
					</div>
				</div>

				{/* SINBAD total */}
				<div className='bg-blue-600 text-white mb-4 rounded-xl p-4 shadow-lg'>
					<div className='flex items-end justify-between'>
						<div>
							<span className='text-xs font-bold uppercase tracking-widest opacity-80'>
								SINBAD Score
							</span>
							<p className='mt-0.5 text-xs opacity-70'>
								Site · Ischemia · Neuropathy · Infection · Area · Depth
							</p>
						</div>
						<span className='text-4xl font-black'>
							{totalGrade}
							<span className='text-lg font-bold opacity-60'>/6</span>
						</span>
					</div>
					{/* Progress bar */}
					<div className='bg-white/20 mt-3 h-2 w-full rounded-full'>
						<div
							className='bg-white h-2 rounded-full transition-all duration-500'
							style={{ width: `${(totalGrade / 6) * 100}%` }}
						/>
					</div>
				</div>

				{/* Risk Stratification Panel */}
				<div className={`mb-4 rounded-xl border ${c.bg} ${c.border} p-4`}>
					<div className='mb-2 flex items-center gap-2'>
						{risk.level === 'HIGH' ? (
							<ShieldAlert className={`h-5 w-5 ${c.icon}`} />
						) : risk.level === 'MODERATE' ? (
							<AlertTriangle className={`h-5 w-5 ${c.icon}`} />
						) : (
							<ShieldCheck className={`h-5 w-5 ${c.icon}`} />
						)}
						<span
							className={`rounded-full px-2 py-0.5 text-[11px] font-black uppercase tracking-widest ${c.badge}`}
						>
							{risk.level} RISK
						</span>
						<span className='text-slate-400 ml-auto text-[10px]'>
							Review in {risk.recommendedInterval}
						</span>
					</div>
					<p className='text-slate-700 text-sm font-semibold'>{risk.message}</p>
					{risk.flags.length > 0 && (
						<ul className='mt-2 space-y-1'>
							{risk.flags.map((f, i) => (
								<li key={i} className='text-slate-600 flex items-start gap-1.5 text-xs'>
									<span className={`mt-0.5 text-[10px] ${c.icon}`}>▶</span>
									{f}
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Next visit */}
				<div className='border-blue-100 bg-blue-50/30 mb-5 rounded-xl border p-3'>
					<label className='text-slate-700 mb-1 block text-sm font-semibold'>
						Recommended Next Visit
						<span className='text-slate-400 ml-2 text-xs font-normal'>
							(auto-set from risk · {risk.recommendedInterval})
						</span>
					</label>
					<input
						type='date'
						className='border-slate-200 w-full rounded-md border p-2 text-sm'
						value={nextVisit}
						onChange={e => setNextVisit(e.target.value)}
						disabled={isSaving}
					/>
				</div>

				{/* Actions */}
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
