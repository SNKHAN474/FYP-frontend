import React, { useMemo } from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Area,
	ComposedChart,
} from 'recharts';

interface ProgressionChartProps {
	annotations: any[];
	selectedUlcerId: string;
}

const UlcerProgressionChart: React.FC<ProgressionChartProps> = ({
	annotations,
	selectedUlcerId,
}) => {
	const chartData = useMemo(() => {
		return annotations
			.filter(a => String(a.ulcerId) === String(selectedUlcerId))
			.map(a => ({
				// Format the date for the X-axis
				date: new Date(a.createdAt).toLocaleDateString('en-GB', {
					day: '2-digit',
					month: 'short',
					hour: '2-digit',
					minute: '2-digit',
				}),
				timestamp: new Date(a.createdAt).getTime(),
				area: a.measurements?.area || 0,
				depth: a.measurements?.avgDepth || 0,
				// Calculate Volume (Area * Depth) if not in DB
				volume: ((a.measurements?.area * a.measurements?.avgDepth) / 1000).toFixed(2),
				grade: a.grading?.totalGrade || 0,
			}))
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [annotations, selectedUlcerId]);

	if (chartData.length < 1) {
		return (
			<div className='bg-slate-50 border-slate-200 text-slate-400 flex h-48 items-center justify-center rounded-xl border-2 border-dashed'>
				Not enough data points yet to show progression.
			</div>
		);
	}

	return (
		<div className='w-full rounded-xl bg-white-primary p-4 shadow-sm'>
			<h4 className='text-slate-700 mb-4 flex items-center gap-2 font-bold'>
				📈 Growth & Grading Trends
			</h4>

			<div className='min-h-[300px] w-full min-w-0'>
				<ResponsiveContainer width='100%' height='100%' minHeight={300}>
					<ComposedChart data={chartData}>
						<CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />

						<XAxis dataKey='date' tick={{ fontSize: 10 }} stroke='#94a3b8' minTickGap={20} />

						<YAxis yAxisId='left' stroke='#3b82f6' tick={{ fontSize: 12 }} width={50} />

						<YAxis
							yAxisId='right'
							orientation='right'
							stroke='#10b981'
							domain={[0, 5]}
							tick={{ fontSize: 12 }}
							width={40}
						/>

						<Tooltip />
						<Legend />

						<Line
							yAxisId='left'
							type='monotone'
							dataKey='area'
							stroke='#3b82f6'
							strokeWidth={2}
							dot={false}
						/>

						<Line
							yAxisId='left'
							type='monotone'
							dataKey='depth'
							stroke='#8b5cf6'
							strokeWidth={2}
							strokeDasharray='4 4'
							dot={false}
						/>

						<Line
							yAxisId='right'
							type='stepAfter'
							dataKey='grade'
							stroke='#10b981'
							strokeWidth={3}
							dot
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default UlcerProgressionChart;
