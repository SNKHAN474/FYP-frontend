import React from 'react';

type Status = 'New' | 'Active' | 'In-Active' | 'Warning';

interface StatusPillProps {
	status: Status;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
	const colors: Record<Status, { bg: string; text: string }> = {
		New: { bg: '#dbeafe', text: '#2563eb' }, // blue-100, blue-600
		Active: { bg: '#dcfce7', text: '#16a34a' }, // green-100, green-600
		'In-Active': { bg: '#ffedd5', text: '#ea580c' }, // orange-100, orange-600
		Warning: { bg: '#fee2e2', text: '#dc2626' }, // red-100, red-600
	};

	const colorStyle = colors[status];

	return (
		<span
			className='inline-flex w-20 items-center justify-center rounded-full px-3 py-1 text-xs font-medium'
			style={{
				backgroundColor: colorStyle.bg,
				color: colorStyle.text,
				border: `1px solid ${colorStyle.text}`, // Border with text color
			}}
		>
			{status}
		</span>
	);
};

export default StatusPill;
