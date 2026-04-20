import React from 'react';

type Status = 'New' | 'Active' | 'In-Active' | 'Warning';

interface StatusPillProps {
	status: Status;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
	const colours: Record<Status, { bg: string; text: string }> = {
		New: { bg: '#dbeafe', text: '#2563eb' },
		Active: { bg: '#dcfce7', text: '#16a34a' },
		'In-Active': { bg: '#ffedd5', text: '#ea580c' },
		Warning: { bg: '#fee2e2', text: '#dc2626' },
	};

	const colourStyle = colours[status];

	return (
		<span
			className='inline-flex w-20 items-center justify-center rounded-full px-3 py-1 text-xs font-medium'
			style={{
				backgroundColor: colourStyle.bg,
				color: colourStyle.text,
				border: `1px solid ${colourStyle.text}`,
			}}
		>
			{status}
		</span>
	);
};

export default StatusPill;
