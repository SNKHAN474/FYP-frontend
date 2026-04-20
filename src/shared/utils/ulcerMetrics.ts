// src/utils/ulcerMetrics.ts

export type DeltaResult = {
	isIncrease: boolean;
	percent: string;
};

export const getDelta = (current: number, previous?: number): DeltaResult | null => {
	if (previous === undefined || previous === 0) return null;

	const diff = current - previous;
	const percent = (diff / previous) * 100;

	return {
		isIncrease: diff > 0,
		percent: Math.abs(percent).toFixed(1),
	};
};
