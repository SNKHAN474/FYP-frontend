// TableHeader.tsx
import { TABLE_GRID } from './TableColumns';

export const TableHeader = () => {
	return (
		<div
			className={`${TABLE_GRID} bg-[#09424A] px-4 py-2 text-sm font-semibold text-white-primary`}
		>
			<div>Name</div>
			<div>Age</div>
			<div>Patient ID</div>
			<div>Treatment Start</div>
			<div>Last Visit</div>
			<div>Next Visit</div>
			<div>Ulcer Grade(s)</div>
			<div>Status</div>
			<div />
		</div>
	);
};
