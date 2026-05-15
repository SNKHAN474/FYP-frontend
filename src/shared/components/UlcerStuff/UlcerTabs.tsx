import React from 'react';
import AddUlcerButton from './AddUlcerButton';

interface Ulcer {
	ulcerId: string;
}

interface Props {
	ulcers: Ulcer[];
	selectedUlcerId: string;
	onSelect: (id: string) => void;
	patientId: string; // 👈 add
}

const UlcerTabs: React.FC<Props> = ({ ulcers, selectedUlcerId, onSelect, patientId }) => {
	return (
		<div className='mt-10 flex flex-wrap gap-3'>
			{ulcers.map((u, index) => (
				<button
					key={u.ulcerId}
					onClick={() => onSelect(u.ulcerId)}
					className={`rounded-lg px-5 py-2 font-semibold transition ${
						selectedUlcerId === u.ulcerId
							? 'bg-[#BB4640] text-white-primary shadow-md'
							: 'bg-gray-200 text-slate-600 hover:bg-gray-300'
					}`}
				>
					Ulcer {index + 1}
				</button>
			))}

			<AddUlcerButton patientId={patientId} />
		</div>
	);
};

export default UlcerTabs;
