import React, { useState, useEffect, useMemo } from 'react';
import {
	TrendingDown,
	TrendingUp,
	Brain,
	Calendar,
	History,
	Clock,
	LayoutGrid,
	LineChart,
	Activity,
	ArrowRight,
	CheckCircle2,
	ShieldAlert,
	Zap,
	Info,
	Timer,
	Layers,
} from 'lucide-react';

interface ScanComparisonCardProps {
	patientId: string;
	selectedUlcerId: string;
}

interface TrajectoryResult {
	overall: {
		trend: 'healing' | 'stable' | 'deteriorating';
		slope: number;
		predictedGrade: number;
	};
	recent: {
		trend: 'healing' | 'stable' | 'deteriorating';
		slope: number;
		predictedGrade: number;
		confidence: 'low' | 'moderate' | 'high';
	};
	estDaysToClosure: number | null;
	dataPoints: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Logic Helpers
// ─────────────────────────────────────────────────────────────────────────────

function linearRegression(xs: number[], ys: number[]) {
	const n = xs.length;
	if (n < 2) return { slope: 0, intercept: ys[0] ?? 0, r2: 0 };
	const xMean = xs.reduce((a, b) => a + b, 0) / n;
	const yMean = ys.reduce((a, b) => a + b, 0) / n;
	let ssxy = 0,
		ssxx = 0,
		ssyy = 0;
	for (let i = 0; i < n; i++) {
		ssxy += (xs[i] - xMean) * (ys[i] - yMean);
		ssxx += (xs[i] - xMean) ** 2;
		ssyy += (ys[i] - yMean) ** 2;
	}
	const slope = ssxx !== 0 ? ssxy / ssxx : 0;
	const intercept = yMean - slope * xMean;
	const r2 = ssyy !== 0 ? Math.min(1, Math.max(0, ssxy ** 2 / (ssxx * ssyy))) : 0;
	return { slope, intercept, r2 };
}

function computeTrajectory(validScans: any[]): TrajectoryResult | null {
	// validScans already has Visit 1 removed from the parent component
	if (validScans.length < 2) return null;

	const recentValid = validScans.slice(-3);

	const getTrend = (slope: number, depthSlope: number) => {
		if (slope > 0.05 || depthSlope > 1.0) return 'deteriorating';
		if (slope < -0.05) return 'healing';
		return 'stable';
	};

	// --- OVERALL CALCULATION (Starting from Visit 2) ---
	const allXs = validScans.map((_, i) => i);
	const allGrades = validScans.map(a => Number(a.grading?.totalGrade || 0));
	const allDepths = validScans.map(a => a.currentDepth || 0);
	const overallGradeReg = linearRegression(allXs, allGrades);
	const overallDepthReg = linearRegression(allXs, allDepths);

	// --- RECENT CALCULATION ---
	const recentXs = recentValid.map((_, i) => i);
	const recentGrades = recentValid.map(a => Number(a.grading?.totalGrade || 0));
	const recentDepths = recentValid.map(a => a.currentDepth || 0);
	const recentGradeReg = linearRegression(recentXs, recentGrades);
	const recentDepthReg = linearRegression(recentXs, recentDepths);

	// Area reduction calculation
	const areas = recentValid.map(a => a.measurements?.area || 0);
	const areaReg = linearRegression(recentXs, areas);
	let estDaysToClosure = null;
	if (areaReg.slope < 0 && recentValid.length >= 2) {
		const msPerDay = 1000 * 60 * 60 * 24;
		const avgDays =
			(new Date(recentValid[recentValid.length - 1].createdAt).getTime() -
				new Date(recentValid[0].createdAt).getTime()) /
			(recentValid.length - 1) /
			msPerDay;
		estDaysToClosure = Math.abs(areas[areas.length - 1] / areaReg.slope) * (avgDays || 7);
	}

	return {
		overall: {
			trend: getTrend(overallGradeReg.slope, overallDepthReg.slope),
			slope: overallGradeReg.slope,
			predictedGrade: Math.round(
				Math.min(
					6,
					Math.max(0, overallGradeReg.slope * validScans.length + overallGradeReg.intercept),
				),
			),
		},
		recent: {
			trend: getTrend(recentGradeReg.slope, recentDepthReg.slope),
			slope: recentGradeReg.slope,
			predictedGrade: Math.round(
				Math.min(
					6,
					Math.max(0, recentGradeReg.slope * validScans.length + recentGradeReg.intercept),
				),
			),
			confidence: validScans.length >= 5 ? 'high' : 'moderate',
		},
		estDaysToClosure,
		dataPoints: validScans.length,
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const ScanComparisonCard: React.FC<ScanComparisonCardProps> = ({ patientId, selectedUlcerId }) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [allAnnotations, setAllAnnotations] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<'timeline' | 'comparison' | 'trajectory'>('timeline');

	useEffect(() => {
		const fetchAnnotations = async () => {
			setLoading(true);
			try {
				const res = await fetch(`http://localhost:3000/annotations/patient/${patientId}`);
				if (res.ok) setAllAnnotations(await res.json());
			} catch (err) {
				console.error('Fetch error:', err);
			} finally {
				setLoading(false);
			}
		};
		if (patientId) fetchAnnotations();
	}, [patientId]);

	const processedScans = useMemo(() => {
		const sortedAll = allAnnotations
			.filter(a => a.ulcerId === selectedUlcerId)
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

		// 1. Ignore the first visit entirely (Visit 1 is unannotated)
		const slicedScans = sortedAll.slice(1);

		// 2. Process the remaining scans (Visit 2 is now our functional Baseline at index 0)
		return slicedScans.map((ann, idx, arr) => {
			const prev = arr[idx - 1];
			const m = ann.measurements;

			const currentDepth =
				m?.maxDepth && m?.minDepth ? m.maxDepth - m.minDepth : m?.ulcerDepth || m?.avgDepth || 0;

			const prevDepth = prev
				? prev.measurements?.maxDepth && prev.measurements?.minDepth
					? prev.measurements.maxDepth - prev.measurements.minDepth
					: prev.measurements?.ulcerDepth || prev.measurements?.avgDepth || 0
				: currentDepth; // If it's the new baseline (Visit 2), delta is 0

			const areaDelta = prev ? (m?.area || 0) - (prev.measurements?.area || 0) : 0;
			const depthDelta = prev ? currentDepth - prevDepth : 0;

			return {
				...ann,
				currentDepth,
				areaDelta,
				depthDelta,
				isImprovement: areaDelta <= 0 && depthDelta <= 0,
				visitNumber: idx + 2, // Visit numbering starts from 2
				isBaseline: idx === 0, // Visit 2 is the relative baseline
			};
		});
	}, [allAnnotations, selectedUlcerId]);

	const trajectory = useMemo(() => computeTrajectory(processedScans), [processedScans]);

	const handleToggleScan = (id: string) => {
		setSelectedIds(prev => {
			if (prev.includes(id)) return prev.filter(i => i !== id);
			if (prev.length >= 2) return [prev[1], id];
			return [...prev, id];
		});
	};

	const comparisonData = useMemo(() => {
		if (selectedIds.length !== 2) return null;
		const a = processedScans.find(ann => ann._id === selectedIds[0]);
		const b = processedScans.find(ann => ann._id === selectedIds[1]);
		if (!a || !b) return null;

		const [oldest, newest] = [a, b].sort(
			(x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
		);

		return {
			oldest,
			newest,
			areaDelta: (newest.measurements?.area || 0) - (oldest.measurements?.area || 0),
			depthDelta: (newest.currentDepth || 0) - (oldest.currentDepth || 0),
			gradeDelta: (newest.grading?.totalGrade || 0) - (oldest.grading?.totalGrade || 0),
			daysBetween: Math.floor(
				(new Date(newest.createdAt).getTime() - new Date(oldest.createdAt).getTime()) /
					(1000 * 60 * 60 * 24),
			),
		};
	}, [selectedIds, processedScans]);

	const getGradeStyles = (grade: number) => {
		if (grade <= 2)
			return {
				bg: 'bg-green-primary',
				text: 'text-green-primary',
				badge: 'bg-green-primary text-white-primary',
				border: 'hover:border-green-primary',
			};
		if (grade <= 4)
			return {
				bg: 'bg-orange-primary',
				text: 'text-orange-primary',
				badge: 'bg-orange-primary text-white-primary',
				border: 'hover:border-orange-primary',
			};
		return {
			bg: 'bg-red-primary',
			text: 'text-red-primary',
			badge: 'bg-red-primary text-white-primary',
			border: 'hover:border-red-primary',
		};
	};

	const getTrendGradient = (trend: string | undefined) => {
		if (trend === 'healing') return 'from-green-primary to-blue-primary shadow-blue-faded';
		if (trend === 'deteriorating') return 'from-red-primary to-slate-primary shadow-slate-faded';
		return 'from-blue-primary to-slate-secondary shadow-blue-faded';
	};

	return (
		<div className='mx-auto w-full max-w-7xl rounded-3xl bg-white-primary p-8 shadow-xl'>
			{/* Header */}
			<div className='mb-8 flex flex-col justify-between gap-6 border-b border-slate-border pb-8 md:flex-row md:items-center'>
				<div>
					<div className='mb-2 flex items-center gap-3'>
						<div className='rounded-lg bg-blue-primary p-2'>
							<Activity className='h-5 w-5 text-white-primary' />
						</div>
						<h3 className='text-2xl font-black tracking-tight text-slate-primary'>
							Wound Progression Analysis
						</h3>
					</div>
					<p className='flex items-center gap-2 text-sm font-medium text-slate-secondary'>
						Monitoring Ulcer{' '}
						<span className='rounded border border-blue-faded bg-cloud-primary px-2 py-0.5 font-mono text-blue-primary'>
							#{selectedUlcerId.slice(-6)}
						</span>
					</p>
				</div>

				<div className='flex gap-1 self-start rounded-2xl border border-slate-border bg-cloud-secondary/50 p-1.5 backdrop-blur-sm'>
					{[
						{ id: 'timeline', label: 'Timeline', icon: Clock },
						{ id: 'comparison', label: 'Comparison', icon: LayoutGrid },
						{ id: 'trajectory', label: 'Trajectory', icon: LineChart },
					].map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as any)}
							className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
								activeTab === tab.id
									? 'translate-y-[-1px] bg-white-primary text-blue-primary shadow-lg'
									: 'text-slate-secondary hover:text-slate-primary'
							}`}
						>
							<tab.icon className='h-3.5 w-3.5' />
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Viewport: Timeline */}
			{activeTab === 'timeline' && (
				<div className='grid grid-cols-1 gap-6 duration-500 animate-in fade-in md:grid-cols-2 xl:grid-cols-3'>
					{processedScans.length > 0 ? (
						processedScans.map(item => {
							const styles = getGradeStyles(item.grading?.totalGrade || 0);
							return (
								<div
									key={item._id}
									className={`group relative rounded-3xl border border-slate-border bg-white-primary p-6 shadow-sm transition-all hover:shadow-xl ${styles.border}`}
								>
									<div className='mb-6 flex items-start justify-between'>
										<div className='flex items-center gap-4'>
											<div className={`rounded-2xl bg-opacity-10 p-3 ${styles.bg} ${styles.text}`}>
												<Calendar className='h-6 w-6' />
											</div>
											<div>
												<p className='text-sm font-black text-slate-primary'>
													{new Date(item.createdAt).toLocaleDateString()}
												</p>
												<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-secondary'>
													<Clock className='h-3 w-3' />{' '}
													{new Date(item.createdAt).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</div>
											</div>
										</div>
										<div className='text-right'>
											<p className='mb-1 text-[10px] font-black uppercase text-slate-secondary'>
												Visit {item.visitNumber}
											</p>
											<span
												className={`rounded-full px-3 py-1 text-[10px] font-black ${styles.badge}`}
											>
												SINBAD {item.grading?.totalGrade || 0}/6
											</span>
										</div>
									</div>
									<div className='space-y-4'>
										<div className='grid grid-cols-2 gap-4'>
											<div>
												<p className='mb-1 text-[10px] font-bold uppercase text-slate-secondary'>
													Surface Area
												</p>
												<p className='text-2xl font-black tracking-tight text-slate-primary'>
													{item.measurements?.area?.toFixed(1) || '0.0'}
													<span className='ml-1 text-xs font-medium text-slate-secondary'>mm²</span>
												</p>
											</div>
											<div>
												<p className='mb-1 text-[10px] font-bold uppercase text-slate-secondary'>
													Wound Depth
												</p>
												<p className='text-2xl font-black tracking-tight text-slate-primary'>
													{item.currentDepth?.toFixed(1) || '0.0'}
													<span className='ml-1 text-xs font-medium text-slate-secondary'>mm</span>
												</p>
											</div>
										</div>
										{!item.isBaseline && (
											<div className='mt-4 grid grid-cols-2 gap-2'>
												<div
													className={`flex flex-col rounded-xl p-2 ${item.areaDelta <= 0 ? 'bg-green-primary/10' : 'bg-red-primary/10'}`}
												>
													<div
														className={`flex items-center gap-1 text-[10px] font-black ${item.areaDelta <= 0 ? 'text-green-primary' : 'text-red-primary'}`}
													>
														{item.areaDelta <= 0 ? (
															<TrendingDown size={12} />
														) : (
															<TrendingUp size={12} />
														)}{' '}
														AREA Δ
													</div>
													<p
														className={`text-sm font-black ${item.areaDelta <= 0 ? 'text-green-primary' : 'text-red-primary'}`}
													>
														{item.areaDelta > 0 ? '+' : ''}
														{item.areaDelta.toFixed(1)} <span className='text-[10px]'>mm²</span>
													</p>
												</div>
												<div
													className={`flex flex-col rounded-xl p-2 ${item.depthDelta <= 0 ? 'bg-green-primary/10' : 'bg-red-primary/10'}`}
												>
													<div
														className={`flex items-center gap-1 text-[10px] font-black ${item.depthDelta <= 0 ? 'text-green-primary' : 'text-red-primary'}`}
													>
														{item.depthDelta <= 0 ? (
															<TrendingDown size={12} />
														) : (
															<TrendingUp size={12} />
														)}{' '}
														DEPTH Δ
													</div>
													<p
														className={`text-sm font-black ${item.depthDelta <= 0 ? 'text-green-primary' : 'text-red-primary'}`}
													>
														{item.depthDelta > 0 ? '+' : ''}
														{item.depthDelta.toFixed(1)} <span className='text-[10px]'>mm</span>
													</p>
												</div>
											</div>
										)}
									</div>
								</div>
							);
						})
					) : (
						<div className='col-span-full rounded-[40px] border-2 border-dashed border-slate-border bg-cloud-primary py-24 text-center'>
							<History className='mx-auto mb-4 h-16 w-16 text-slate-border' />
							<p className='text-lg font-bold text-slate-secondary'>No visit history available.</p>
						</div>
					)}
				</div>
			)}

			{/* Viewport: Comparison */}
			{activeTab === 'comparison' && (
				<div className='space-y-8 duration-500 animate-in fade-in'>
					{comparisonData ? (
						<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
							<div className='rounded-[32px] border border-slate-border bg-cloud-primary p-8 lg:col-span-2'>
								<div className='mb-8 flex items-center justify-between'>
									<h4 className='text-xl font-black text-slate-primary'>Comparison Delta</h4>
									<span className='rounded-full bg-blue-primary px-4 py-1 text-xs font-bold text-white-primary'>
										{comparisonData.daysBetween} Day Interval
									</span>
								</div>
								<div className='grid grid-cols-3 gap-6'>
									<div className='rounded-2xl border border-slate-border bg-white-primary p-6 shadow-sm'>
										<p className='mb-2 text-[10px] font-black uppercase text-slate-secondary'>
											Area Δ
										</p>
										<div className='flex items-baseline gap-2'>
											<span className='text-3xl font-black text-slate-primary'>
												{comparisonData.areaDelta > 0 ? '+' : ''}
												{comparisonData.areaDelta.toFixed(1)}
											</span>
											<span className='text-xs font-bold text-slate-secondary'>mm²</span>
										</div>
									</div>
									<div className='rounded-2xl border border-slate-border bg-white-primary p-6 shadow-sm'>
										<p className='mb-2 text-[10px] font-black uppercase text-slate-secondary'>
											Depth Δ
										</p>
										<div className='flex items-baseline gap-2'>
											<span className='text-3xl font-black text-slate-primary'>
												{comparisonData.depthDelta > 0 ? '+' : ''}
												{comparisonData.depthDelta.toFixed(1)}
											</span>
											<span className='text-xs font-bold text-slate-secondary'>mm</span>
										</div>
									</div>
									<div className='rounded-2xl border border-slate-border bg-white-primary p-6 shadow-sm'>
										<p className='mb-2 text-[10px] font-black uppercase text-slate-secondary'>
											SINBAD Δ
										</p>
										<div className='flex items-baseline gap-2'>
											<span className='text-3xl font-black text-slate-primary'>
												{comparisonData.gradeDelta > 0 ? '+' : ''}
												{comparisonData.gradeDelta}
											</span>
											<span className='text-xs font-bold text-slate-secondary'>Pts</span>
										</div>
									</div>
								</div>
							</div>
							<div className='flex flex-col justify-between rounded-[32px] bg-slate-primary p-8 text-white-primary shadow-xl'>
								<div>
									<p className='mb-4 text-[10px] font-black uppercase tracking-widest text-white-primary/60'>
										Timeline Shift
									</p>
									<div className='space-y-4'>
										<div className='flex justify-between text-sm'>
											<span className='opacity-70'>V{comparisonData.oldest.visitNumber}:</span>
											<span className='font-mono'>
												{new Date(comparisonData.oldest.createdAt).toLocaleDateString()}
											</span>
										</div>
										<ArrowRight className='mx-auto opacity-30' />
										<div className='flex justify-between text-sm'>
											<span className='opacity-70'>V{comparisonData.newest.visitNumber}:</span>
											<span className='font-mono'>
												{new Date(comparisonData.newest.createdAt).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>
								<button
									onClick={() => setSelectedIds([])}
									className='mt-8 w-full rounded-xl bg-white-primary py-3 text-sm font-black text-slate-primary transition-colors hover:bg-cloud-primary'
								>
									Reset Selection
								</button>
							</div>
						</div>
					) : (
						<div className='rounded-[32px] border-2 border-dashed border-slate-border bg-cloud-primary p-12 text-center'>
							<Layers className='mx-auto mb-4 text-blue-faded' size={48} />
							<h4 className='text-lg font-black text-slate-primary'>
								Select Two Visits to Compare
							</h4>
							<p className='mt-2 text-sm text-slate-secondary'>
								Compare area, depth, and grading shifts between specific dates.
							</p>
						</div>
					)}
					<div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5'>
						{processedScans.map(ann => (
							<button
								key={ann._id}
								onClick={() => handleToggleScan(ann._id)}
								className={`relative rounded-2xl border-2 p-4 text-left transition-all ${selectedIds.includes(ann._id) ? 'border-blue-primary bg-blue-faded/20 ring-4 ring-blue-primary/10' : 'border-slate-border bg-white-primary'}`}
							>
								{selectedIds.includes(ann._id) && (
									<div className='absolute -right-2 -top-2 rounded-full bg-blue-primary p-1 text-white-primary'>
										<CheckCircle2 size={14} />
									</div>
								)}
								<p className='text-[10px] font-black uppercase text-slate-secondary'>
									V{ann.visitNumber} — {new Date(ann.createdAt).toLocaleDateString()}
								</p>
								<p className='font-black text-slate-primary'>
									G{ann.grading?.totalGrade} | {ann.currentDepth.toFixed(1)}mm
								</p>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Viewport: Trajectory */}
			{activeTab === 'trajectory' && (
				<div className='space-y-8 duration-700 animate-in fade-in'>
					<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
						{/* 1. RECENT TREND */}
						<div
							className={`relative overflow-hidden rounded-[40px] bg-gradient-to-br p-8 text-white-primary shadow-2xl ${getTrendGradient(trajectory?.recent.trend)}`}
						>
							<div className='relative z-10'>
								<div className='mb-6 flex items-center justify-between'>
									<div className='rounded-2xl border border-white-primary/20 bg-white-primary/10 p-3 backdrop-blur-xl'>
										<Zap className='h-6 w-6' />
									</div>
									<span className='flex items-center gap-1 rounded-full bg-white-primary/20 px-3 py-1 text-[10px] font-bold uppercase backdrop-blur-md'>
										<ShieldAlert className='h-3 w-3' /> Confidence: {trajectory?.recent.confidence}
									</span>
								</div>
								<p className='mb-1 text-xs font-black uppercase tracking-widest text-white-primary/80'>
									Recent Trajectory (Last 3 Scans)
								</p>
								<h4 className='text-5xl font-black capitalize'>
									{trajectory?.recent.trend || 'Stable'}
								</h4>
								<div className='mt-8 flex items-end justify-between'>
									<div>
										<p className='text-[10px] font-black uppercase text-white-primary/60'>
											Next Scan Exp.
										</p>
										<p className='text-4xl font-black'>
											{trajectory?.recent.predictedGrade}
											<span className='text-sm opacity-40'>/6</span>
										</p>
									</div>
									<div className='text-right'>
										<p className='text-[10px] font-black uppercase text-white-primary/60'>
											Recent Rate
										</p>
										<p className='text-xl font-bold'>
											{trajectory?.recent.slope > 0 ? '+' : ''}
											{trajectory?.recent.slope.toFixed(2)}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* 2. OVERALL TREND (Starting from Visit 2) */}
						<div className='relative overflow-hidden rounded-[40px] border border-slate-border bg-white-primary p-8 shadow-sm'>
							<div className='mb-6 flex items-center justify-between'>
								<div className='bg-slate-100 text-slate-400 rounded-2xl p-3'>
									<History className='h-6 w-6' />
								</div>
								<span className='bg-slate-100 text-slate-500 rounded-full px-3 py-1 text-[10px] font-bold uppercase'>
									History Log
								</span>
							</div>
							<p className='text-slate-400 mb-1 text-xs font-black uppercase tracking-widest'>
								Overall Progress (Visit 2 to Current)
							</p>
							<h4 className='text-5xl font-black capitalize text-slate-primary'>
								{trajectory?.overall.trend}
							</h4>
							<div className='border-slate-100 mt-8 flex items-end justify-between border-t pt-6'>
								<div>
									<p className='text-slate-400 text-[10px] font-black uppercase'>
										Annotated Visits
									</p>
									<p className='text-3xl font-black text-slate-primary'>{trajectory?.dataPoints}</p>
								</div>
								<div className='text-right'>
									<p className='text-slate-400 text-[10px] font-black uppercase'>Baseline Slope</p>
									<p className='text-xl font-bold text-slate-primary'>
										{trajectory?.overall.slope.toFixed(2)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Secondary Metrics Grid */}
					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						<div className='rounded-3xl border border-slate-border bg-white-primary p-6 shadow-sm'>
							<div className='mb-4 flex items-center gap-3 text-blue-primary'>
								<Timer className='h-5 w-5' />
								<h5 className='text-sm font-black uppercase tracking-tight'>Est. Resolution</h5>
							</div>
							{trajectory?.estDaysToClosure ? (
								<div>
									<p className='text-4xl font-black text-slate-primary'>
										~{Math.round(trajectory.estDaysToClosure)}{' '}
										<span className='text-sm font-medium text-slate-secondary'>days</span>
									</p>
									<p className='mt-2 text-xs leading-relaxed text-slate-secondary'>
										Based on recent volumetric area reduction rate.
									</p>
								</div>
							) : (
								<div>
									<p className='text-xl font-black italic text-slate-secondary'>N/A</p>
									<p className='mt-2 text-xs text-slate-secondary'>
										Wound is not following a reductive trend.
									</p>
								</div>
							)}
						</div>

						<div className='rounded-3xl border border-slate-border bg-white-primary p-6 shadow-sm'>
							<div className='mb-4 flex items-center gap-3 text-orange-primary'>
								<Activity className='h-5 w-5' />
								<h5 className='text-sm font-black uppercase tracking-tight'>Clinical Guidance</h5>
							</div>
							<div
								className={`rounded-xl px-4 py-3 text-xs font-bold ${trajectory?.recent.trend === 'deteriorating' ? 'bg-red-primary/10 text-red-primary' : trajectory?.recent.trend === 'stable' ? 'bg-orange-primary/10 text-orange-primary' : 'bg-green-primary/10 text-green-primary'}`}
							>
								{trajectory?.recent.trend === 'deteriorating'
									? 'ALERT: Immediate intervention required. Current data shows growth.'
									: trajectory?.recent.trend === 'stable'
										? 'ADVISORY: Stagnation detected in last 3 scans. Consider offloading check.'
										: 'POSITIVE: Recent scans show active healing trajectory.'}
							</div>
							<p className='text-slate-400 mt-3 text-[10px] italic'>
								Guidance prioritises the most recent clinical behavior.
							</p>
						</div>

						<div className='rounded-3xl border border-slate-border bg-white-primary p-6 shadow-sm'>
							<div className='mb-4 flex items-center gap-3 text-slate-primary'>
								<Brain className='h-5 w-5' />
								<h5 className='text-sm font-black uppercase tracking-tight'>Long-term Outlook</h5>
							</div>
							<div className='flex h-[calc(100%-40px)] flex-col justify-center'>
								<p className='text-sm font-medium leading-snug text-slate-secondary'>
									Since the <span className='font-black text-slate-primary'>Visit 2 baseline</span>,
									this wound has shown an overall{' '}
									<span className='font-black text-slate-primary'>{trajectory?.overall.trend}</span>{' '}
									pattern across {trajectory?.dataPoints} annotated visits.
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ScanComparisonCard;
