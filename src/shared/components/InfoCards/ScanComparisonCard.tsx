import React, { useState, useEffect } from 'react';

interface ScanComparisonCardProps {
	scans: any[];
	patientId: string;
}

const ScanComparisonCard: React.FC<ScanComparisonCardProps> = ({ scans, patientId }) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [annotations, setAnnotations] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchAnnotations = async () => {
			setLoading(true);
			try {
				const res = await fetch(`http://localhost:3000/annotations/patient/${patientId}`);
				if (res.ok) {
					const data = await res.json();
					setAnnotations(data);
				}
			} catch (err) {
				console.error('Error fetching comparison data:', err);
			} finally {
				setLoading(false);
			}
		};
		if (patientId) fetchAnnotations();
	}, [patientId]);

	const handleSelect = (id: string) => {
		setSelectedIds(prev => {
			if (prev.includes(id)) return prev.filter(i => i !== id);
			if (prev.length >= 2) return [prev[1], id];
			return [...prev, id];
		});
	};

	const getScanData = (id: string) => {
		const scan = scans.find(s => s._id === id);
		const ann = annotations.find(a => a.scanId === id);
		const m = ann?.measurements;

		// Calculate actual depth (Difference between deepest point and surface)
		const actualDepth = m?.maxDepth && m?.minDepth ? Math.abs(m.maxDepth - m.minDepth) : 0;

		return {
			scan,
			measurements: m ? { ...m, calculatedDepth: actualDepth } : null,
		};
	};

	const renderMetric = (label: string, valA: number, valB: number, unit: string) => {
		const diff = valB - valA;
		const percentChange = valA !== 0 ? ((diff / valA) * 100).toFixed(1) : '0.0';
		const isIncrease = diff > 0;
		const colorClass = isIncrease ? 'text-red-600' : 'text-emerald-600';
		const bgClass = isIncrease ? 'bg-red-50' : 'bg-emerald-50';

		return (
			<div
				className={`${bgClass} border-slate-100 flex flex-col items-center justify-center rounded-xl border p-5 shadow-sm`}
			>
				<p className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>
					{label} Trend
				</p>
				<div className={`flex items-center gap-2 text-3xl font-black ${colorClass}`}>
					<span>{isIncrease ? '↑' : '↓'}</span>
					<span>{Math.abs(diff).toFixed(2)}</span>
					<span className='text-sm font-bold'>{unit}</span>
				</div>
				<p className={`text-[10px] font-bold ${colorClass}`}>
					{isIncrease ? '+' : ''}
					{percentChange}% change
				</p>
			</div>
		);
	};

	const sortedSelected = [...selectedIds].sort((a, b) => {
		const dateA = new Date(scans.find(s => s._id === a)?.created || 0).getTime();
		const dateB = new Date(scans.find(s => s._id === b)?.created || 0).getTime();
		return dateA - dateB;
	});

	const dataA = sortedSelected[0] ? getScanData(sortedSelected[0]) : null;
	const dataB = sortedSelected[1] ? getScanData(sortedSelected[1]) : null;

	return (
		<div className='w-full rounded-2xl bg-white-primary p-6 shadow-sm'>
			<div className='mb-6'>
				<h3 className='text-slate-800 text-xl font-bold'>Wound Progression Analysis</h3>
				<p className='text-slate-500 text-sm'>Comparing historical measurements</p>
			</div>

			<div className='mb-8 flex flex-wrap gap-3'>
				{scans.map(scan => {
					const ann = annotations.find(a => a.scanId === scan._id);
					const isSelected = selectedIds.includes(scan._id);
					return (
						<button
							key={scan._id}
							disabled={!ann}
							onClick={() => handleSelect(scan._id)}
							className={`flex min-w-[120px] flex-col items-start rounded-xl border-2 px-5 py-3 transition-all ${
								isSelected
									? 'border-blue-600 bg-blue-50 ring-blue-50 ring-4'
									: ann
										? 'border-slate-100 bg-slate-50 hover:border-slate-300'
										: 'cursor-not-allowed opacity-40'
							}`}
						>
							<span className='text-xs font-black'>
								{new Date(scan.created).toLocaleDateString('en-GB')}
							</span>
							<span className='text-slate-400 text-[10px]'>{ann ? 'Processed' : 'No Data'}</span>
						</button>
					);
				})}
			</div>

			{dataA?.measurements && dataB?.measurements ? (
				<div className='space-y-8 animate-in fade-in slide-in-from-bottom-2'>
					<div className='grid grid-cols-2 gap-6'>
						{renderMetric('Area', dataA.measurements.area, dataB.measurements.area, 'mm²')}
						{renderMetric(
							'Depth',
							dataA.measurements.calculatedDepth,
							dataB.measurements.calculatedDepth,
							'mm',
						)}
					</div>

					<div className='border-slate-100 overflow-hidden rounded-xl border'>
						<table className='w-full text-left text-sm'>
							<thead className='bg-slate-50 text-slate-500 text-[10px] font-bold uppercase'>
								<tr>
									<th className='px-4 py-3'>Metric</th>
									<th className='px-4 py-3'>Baseline</th>
									<th className='text-blue-600 px-4 py-3'>Latest</th>
								</tr>
							</thead>
							<tbody className='divide-slate-100 divide-y'>
								<tr>
									<td className='text-slate-500 px-4 py-3 font-medium'>Surface Area</td>
									<td className='px-4 py-3'>{dataA.measurements.area.toFixed(2)} mm²</td>
									<td className='px-4 py-3 font-bold'>{dataB.measurements.area.toFixed(2)} mm²</td>
								</tr>
								<tr>
									<td className='text-slate-500 px-4 py-3 font-medium'>Wound Depth (Pit)</td>
									<td className='px-4 py-3'>{dataA.measurements.calculatedDepth.toFixed(2)} mm</td>
									<td className='px-4 py-3 font-bold'>
										{dataB.measurements.calculatedDepth.toFixed(2)} mm
									</td>
								</tr>
								<tr>
									<td className='text-slate-500 px-4 py-3 font-medium'>Avg Sensor Dist</td>
									<td className='text-slate-400 px-4 py-3'>
										{dataA.measurements.avgDepth.toFixed(1)}
									</td>
									<td className='text-slate-400 px-4 py-3'>
										{dataB.measurements.avgDepth.toFixed(1)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className='border-slate-200 bg-slate-50 text-slate-400 flex h-48 items-center justify-center rounded-xl border-2 border-dashed'>
					Select two scans to see the delta analysis
				</div>
			)}
		</div>
	);
};

export default ScanComparisonCard;
