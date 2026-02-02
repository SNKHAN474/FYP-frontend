import { type FC } from 'react';
import { X } from 'lucide-react';

type Props = {
	closeModal: () => void;
};

const CloseButton: FC<Props> = ({ closeModal }) => (
	<button
		type='button'
		onClick={closeModal}
		className='absolute right-4 top-4 z-50 rounded-2xl bg-white-primary p-2'
	>
		<X size={28} />
	</button>
);

export default CloseButton;
