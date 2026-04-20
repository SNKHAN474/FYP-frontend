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
		const labels = chart.data.labels;

		meta.data.forEach((slice: any, index: number) => {
			// Only draw if the slice is large enough to see
			if (data[index] > 0) {
				const { x, y } = slice.tooltipPosition();
				ctx.fillText(`${data[index]}`, x, y);
			}
		});

		ctx.restore();
	},
};

// Register core + plugin
ChartJS.register(ArcElement, Tooltip, Legend, Title, PieSliceLabelPlugin);

interface ChartProps {
	patients: any[];
}

// ===============================
// Scan Status Pie Chart (Uses MongoDB "Personal Details.Status")
// ===============================
export const ScanStatusPieChart: React.FC<ChartProps> = ({ patients }) => {
	// Extract status from MongoDB nested structure
	const statusCounts = (patients || []).reduce((acc: Record<string, number>, p) => {
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
// Ulcer Grade Doughnut Chart (Iterates MongoDB "Ulcers" Array)
// ===============================
export const UlcerGradeDoughnut: React.FC<ChartProps> = ({ patients }) => {
	// Iterate through every patient and every ulcer in their Ulcers array
	const gradeCounts = (patients || []).reduce((acc: Record<string, number>, patient) => {
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

	// Sort labels numerically (Grade 1, 2, 3...)
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
