import { type FC } from 'react';
import { Pencil, Undo2, History } from 'lucide-react';
import { cn } from '../../../shared/utils/helpers';

type Props = {
	undoAll: () => void;
	undo: () => void;
	handleDrawMode: () => void;
	drawMode: boolean;
	disabledButtons: boolean;
};

const Toolbar: FC<Props> = props => {
	const { undoAll, undo, drawMode, handleDrawMode, disabledButtons } = props;
	return (
		<div className='absolute left-4 top-4 z-50 flex flex-col items-center gap-y-6 rounded-2xl bg-white-primary p-3'>
			<button
				disabled={disabledButtons}
				type='button'
				onClick={handleDrawMode}
				className='disabled:opacity-50'
			>
				<Pencil
					size={24}
					className={cn({
						'text-green-primary': drawMode,
					})}
				/>
			</button>
			<button
				type='button'
				className='disabled:opacity-50'
				onClick={undo}
				disabled={disabledButtons}
			>
				<Undo2 size={24} />
			</button>
			<button
				type='button'
				className='disabled:opacity-50'
				onClick={undoAll}
				disabled={disabledButtons}
			>
				<History size={24} />
			</button>
		</div>
	);
};

export default Toolbar;
