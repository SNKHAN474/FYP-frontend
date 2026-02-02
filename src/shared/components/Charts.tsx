import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import patientsData from '../../data/dummy_data.json';

// ===============================
// Plugin: White labels inside pie slices (ONLY applied to Pie chart)
// ===============================
const PieSliceLabelPlugin = {
	id: 'pieSliceLabel',
	afterDraw(chart: any) {
		// Only apply if chart type is PIE (not doughnut)
		if (chart.config.type !== 'pie') return;

		const { ctx } = chart;

		ctx.save();
		ctx.font = 'bold 14px sans-serif';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		const meta = chart.getDatasetMeta(0);
		const data = chart.data.datasets[0].data;
		const labels = chart.data.labels;

		meta.data.forEach((slice: any, index: number) => {
			const { x, y } = slice.tooltipPosition();
			const value = data[index];
			const label = labels[index];

			ctx.fillText(`${value} ${label}`, x, y);
		});

		ctx.restore();
	},
};

// Register core + plugin
ChartJS.register(ArcElement, Tooltip, Legend, Title, PieSliceLabelPlugin);

// ===============================
// Scan Status Pie Chart
// ===============================
export const ScanStatusPieChart: React.FC = () => {
	const patients = patientsData.patients;

	// Count each scanStatus
	const statusCounts = patients.reduce((acc: Record<string, number>, p) => {
		const status = p.scanStatus || 'No Scans';
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
				backgroundColor: ['#63ff94ff', '#058c10ff', '#9966FF', '#4BC0C0', '#ff6666ff'],
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			tooltip: {
				enabled: false,
				external: function (context) {
					// Create tooltip element if it doesn't exist
					let tooltipEl = document.getElementById('chartjs-tooltip');
					if (!tooltipEl) {
						tooltipEl = document.createElement('div');
						tooltipEl.id = 'chartjs-tooltip';
						tooltipEl.style.position = 'absolute';
						tooltipEl.style.background = 'rgba(0,0,0,0.8)';
						tooltipEl.style.color = 'white';
						tooltipEl.style.padding = '8px 10px';
						tooltipEl.style.borderRadius = '6px';
						tooltipEl.style.pointerEvents = 'none';
						tooltipEl.style.transform = 'translate(-50%, -100%)';
						tooltipEl.style.whiteSpace = 'nowrap';
						document.body.appendChild(tooltipEl);
					}

					const tooltip = context.tooltip;

					if (tooltip.opacity === 0) {
						tooltipEl.style.opacity = '0';
						return;
					}

					tooltipEl.style.opacity = '1';
					tooltipEl.innerHTML = tooltip.body[0].lines[0];

					const { x, y } = context.chart.canvas.getBoundingClientRect();

					tooltipEl.style.left = x + tooltip.caretX + 'px';
					tooltipEl.style.top = y + tooltip.caretY + 'px';
				},
			},

			title: {
				display: true,
				text: 'Scan Status Distribution',
				font: {
					size: 20,
					weight: 'bold',
				},
				padding: { bottom: 10 },
				position: 'top',
				align: 'start',
			},
			legend: {
				position: 'right',
				align: 'end',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					generateLabels: (chart: any) => {
						return chart.data.labels.map((label: any, index: number) => ({
							text: `${label}`,
							fillStyle: chart.data.datasets[0].backgroundColor[index],
							strokeStyle: chart.data.datasets[0].backgroundColor[index],
							lineWidth: 1,
							hidden: false,
							index,
						}));
					},
				},
			},
		},
		layout: {
			padding: {
				right: 50,
			},
		},
		maintainAspectRatio: false,
	};

	return (
		<div className='relative h-full min-h-[300px] w-full lg:max-h-[560px] lg:max-w-[705px]'>
			<div className='absolute inset-0 flex items-center justify-start rounded-xl border border-slate-border bg-white-primary p-4 shadow-sm'>
				<Pie data={data} options={options} />
			</div>
		</div>
	);
};

// ===============================
// Ulcer Grade Doughnut Chart (NO slice labels)
// ===============================
export const UlcerGradeDoughnut: React.FC = () => {
	const patients = patientsData.patients;

	// Count ulcer grade (support multiple grades separated by "|")
	const gradeCounts = patients.reduce((acc: Record<string, number>, patient) => {
		if (!patient.ulcerGrade || patient.ulcerGrade.trim() === '') {
			acc['Unreviewed'] = (acc['Unreviewed'] || 0) + 1;
			return acc;
		}

		const grades = patient.ulcerGrade.split('|').map(g => g.trim());
		grades.forEach(grade => {
			acc[grade] = (acc[grade] || 0) + 1;
		});

		return acc;
	}, {});

	const labels = Object.keys(gradeCounts).sort();
	const values = Object.values(gradeCounts);

	const data = {
		labels,
		datasets: [
			{
				data: values,
				backgroundColor: [
					'#393939',
					'#34ACBE',
					'#09424A',
					'#C2E4E9',
					'#BB4640',
					'#F75F57',
					'#ffed85ff',
				],
				cutout: '80%',
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: 'Ulcer Grade Distribution',
				font: {
					size: 18,
					weight: 'bold',
				},
				padding: { bottom: 10 },
				position: 'top' as const,
				align: 'start',
			},
			legend: {
				position: 'bottom' as const,
				align: 'center',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					generateLabels: (chart: any) => {
						return chart.data.labels.map((label: any, index: number) => ({
							text: `Grade ${label}`,
							fillStyle: chart.data.datasets[0].backgroundColor[index],
							strokeStyle: chart.data.datasets[0].backgroundColor[index],
							lineWidth: 1,
							hidden: false,
							index,
						}));
					},
				},
			},
		},
		maintainAspectRatio: false,
	};

	return (
		<div className='relative h-full min-h-[250px] w-full lg:max-h-[413px] lg:max-w-[338px]'>
			<div className='absolute inset-0 flex items-center justify-center rounded-xl border border-slate-border bg-white-primary p-4 shadow-sm'>
				<Doughnut data={data} options={options} />
			</div>
		</div>
	);
};
