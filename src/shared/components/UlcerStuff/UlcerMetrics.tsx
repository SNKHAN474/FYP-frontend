import React, { useMemo } from 'react';

interface Scan {
	_id: string;
	glucoseLiveReadings?: number;
}

interface Annotation {
	scanId: string;
	ulcerId: string;
	measurements?: {
		area?: number;
		avgDepth?: number;
		temperature?: number; // Added since you have a Temp card
	};
	grading?: {
		totalGrade?: number;
	};
	createdAt?: string;
}

interface Props {
	scans: Scan[];
	annotations: Annotation[];
	selectedUlcerId: string;
}

const UlcerMetrics: React.FC<Props> = ({ scans, annotations, selectedUlcerId }) => {
	// 1. Get all history for this specific ulcer
	const ulcerAnnotations = useMemo(
		() => annotations.filter(a => a.ulcerId === selectedUlcerId),
		[annotations, selectedUlcerId],
	);

	// 2. Count unique scans (History length)
	const numberOfScans = ulcerAnnotations.length;

	// 3. Get the most recent entry to display current stats
	const latest = useMemo(() => {
		if (ulcerAnnotations.length === 0) return null;
		return [...ulcerAnnotations].sort(
			(a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime(),
		)[0];
	}, [ulcerAnnotations]);

	// Formatting helper to keep JSX clean
	const getValue = (val: any, unit: string = '') =>
		val !== undefined && val !== null ? `${val}${unit}` : '-';

	const metrics = [
		{
			label: 'Number of Scans',
			value: numberOfScans,
		},
		{
			label: 'Temp',
			value: getValue(latest?.measurements?.temperature, '°C'),
		},
		{
			label: 'Volume',
			value: latest?.measurements?.area ? `${latest.measurements.area.toFixed(2)} mm²` : '-',
		},
		{
			label: 'Depth',
			value: latest?.measurements?.avgDepth ? `${latest.measurements.avgDepth.toFixed(2)} mm` : '-',
		},
		{
			label: 'Glucose',
			value: useMemo(() => {
				const scan = scans.find(s => s._id === latest?.scanId);
				return getValue(scan?.glucoseLiveReadings, ' mmol/L');
			}, [latest, scans]),
		},
		{
			label: 'Ulcer Grade',
			value: getValue(latest?.grading?.totalGrade),
		},
	];

	return (
		<div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
			{metrics.map((item, i) => (
				<div
					key={i}
					className='rounded-xl bg-gradient-to-br from-[#09424A] via-[#0C5E6A] to-[#34ACBE] p-5 text-white-primary shadow-sm'
				>
					<p className='text-xs opacity-80'>{item.label}</p>
					<p className='text-2xl font-bold'>{item.value}</p>
				</div>
			))}
		</div>
	);
};

export default UlcerMetrics;
