import { useMemo, useState } from 'react';
import type { Scan } from '../../../types/ScanTypes';
import { formatDate } from '../../../shared/utils/helpers';

const useDateSelection = (scans: Scan[]) => {
	const [selectedDates, setSelectedDates] = useState([
		formatDate(scans[0]?.created),
		formatDate(scans[1]?.created),
	]);

	const firstScan = scans.find(scan => formatDate(scan.created) === selectedDates[0]);
	const secondScan = scans.find(scan => formatDate(scan.created) === selectedDates[1]);

	//if (!firstScan || !secondScan) throw new Error("Couldn't find scans");

	const dateOptions = useMemo(
		() =>
			scans.map(scan => ({
				label: formatDate(scan.created),
				value: formatDate(scan.created),
			})),
		[scans],
	);

	const updateFirstDate = (value: string) => {
		setSelectedDates(prev => [value, prev[1]]);
	};

	const updateSecondDate = (value: string) => {
		setSelectedDates(prev => [prev[0], value]);
	};

	return { firstScan, secondScan, dateOptions, updateFirstDate, updateSecondDate };
};

export default useDateSelection;
