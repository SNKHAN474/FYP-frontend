// utils/mapStatusToPill.ts
export type PillStatus = 'New' | 'Active' | 'In-Active' | 'Warning' | 'Urgent';

export const mapStatusToPill = (status: string): PillStatus => {
	switch (status) {
		case 'Urgent':
			return 'Urgent';
		case 'Active':
			return 'Active';
		case 'In-Active':
		case 'Inactive':
			return 'In-Active';
		case 'New':
			return 'New';
		default:
			return 'Warning';
	}
};
