import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// ===============================
// Plugin: White labels inside pie slices
// ===============================
const PieSliceLabelPlugin = {
	id: 'pieSliceLabel',
	afterDraw(chart: any) {
		if (chart.config.type !== 'pie') return;

		const { ctx } = chart;
		ctx.save();
		ctx.font = 'bold 12px sans-serif';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		const meta = chart.getDatasetMeta(0);
		const data = chart.data.datasets[0].data;

		meta.data.forEach((slice: any, index: number) => {
			if (data[index] > 0) {
				const { x, y } = slice.tooltipPosition();
				ctx.fillText(`${data[index]}`, x, y);
			}
		});

		ctx.restore();
	},
};

ChartJS.register(ArcElement, Tooltip, Legend, Title, PieSliceLabelPlugin);

interface ChartProps {
	patients: any[];
}

// ===============================
// Reusable Empty State Component
// ===============================
const EmptyChartState = ({ title }: { title: string }) => (
	<div className='border-slate-200 flex h-full flex-col items-center justify-center rounded-xl bg-white-primary p-4 shadow-sm'>
		<h3 className='mb-4 w-full text-left text-[18px] font-bold text-[#666]'>{title}</h3>
		<div className='flex flex-1 flex-col items-center justify-center'>
			<p className='text-gray-400 font-medium italic'>No patient data available</p>
		</div>
	</div>
);

// ===============================
// Scan Status Pie Chart
// ===============================
export const ScanStatusPieChart: React.FC<ChartProps> = ({ patients }) => {
	// Check if we actually have patients to display
	if (!patients || patients.length === 0) {
		return (
			<div className='relative h-[300px] w-full lg:max-w-[500px]'>
				<EmptyChartState title='Patient Status Overview' />
			</div>
		);
	}

	const statusCounts = patients.reduce((acc: Record<string, number>, p) => {
		const status = p['Personal Details']?.Status || 'No Status';
		acc[status] = (acc[status] || 0) + 1;
		return acc;
	}, {});

	const labels = Object.keys(statusCounts);
	const values = Object.values(statusCounts);

	const data = {
		labels,
		datasets: [
			{
				data: values,
				backgroundColor: ['#058c10ff', '#ff6666ff', '#9966FF', '#4BC0C0', '#63ff94ff'],
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: 'Patient Status Overview',
				font: { size: 18, weight: 'bold' as const },
				align: 'start' as const,
			},
			legend: {
				position: 'right' as const,
				labels: { usePointStyle: true, pointStyle: 'circle' },
			},
		},
		maintainAspectRatio: false,
	};

	return (
		<div className='relative h-[300px] w-full lg:max-w-[500px]'>
			<div className='border-slate-200 flex h-full items-center justify-center rounded-xl bg-white-primary p-4 shadow-sm'>
				<Pie data={data} options={options} />
			</div>
		</div>
	);
};

// ===============================
// Ulcer Grade Doughnut Chart
// ===============================
export const UlcerGradeDoughnut: React.FC<ChartProps> = ({ patients }) => {
	// Check if we have patients
	if (!patients || patients.length === 0) {
		return (
			<div className='relative h-[350px] w-full lg:max-w-[350px]'>
				<EmptyChartState title='Ulcer Grade Distribution' />
			</div>
		);
	}

	const gradeCounts = patients.reduce((acc: Record<string, number>, patient) => {
		if (patient.Ulcers && Array.isArray(patient.Ulcers) && patient.Ulcers.length > 0) {
			patient.Ulcers.forEach((ulcer: any) => {
				const grade = ulcer.UlcerGrade || 'Unreviewed';
				acc[grade] = (acc[grade] || 0) + 1;
			});
		} else {
			acc['No Ulcers'] = (acc['No Ulcers'] || 0) + 1;
		}
		return acc;
	}, {});

	const labels = Object.keys(gradeCounts).sort();
	const values = labels.map(label => gradeCounts[label]);

	const data = {
		labels,
		datasets: [
			{
				data: values,
				backgroundColor: [
					'#34ACBE',
					'#F75F57',
					'#09424A',
					'#BB4640',
					'#C2E4E9',
					'#ffed85ff',
					'#393939',
				],
				cutout: '75%',
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: 'Ulcer Grade Distribution',
				font: { size: 18, weight: 'bold' as const },
				align: 'start' as const,
			},
			legend: {
				position: 'bottom' as const,
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					generateLabels: (chart: any) => {
						const original = ChartJS.overrides.doughnut.plugins.legend.labels.generateLabels;
						const labelsArray = original(chart);
						return labelsArray.map((label: any) => ({
							...label,
							text:
								label.text === 'No Ulcers' || label.text === 'Unreviewed'
									? label.text
									: `Grade ${label.text}`,
						}));
					},
				},
			},
		},
		maintainAspectRatio: false,
	};

	return (
		<div className='relative h-[350px] w-full lg:max-w-[350px]'>
			<div className='border-slate-200 flex h-full items-center justify-center rounded-xl bg-white-primary p-4 shadow-sm'>
				<Doughnut data={data} options={options} />
			</div>
		</div>
	);
};
