import { Fragment, type ReactNode, useState, type FC } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { cn } from '../../utils/helpers';

type Props = {
	children: ReactNode;
	handleShowModal: () => void;
	showModal: boolean;
	panelClassName?: string;
	canvas?: boolean;
	disableTransition?: boolean;
};

const Modal: FC<Props> = props => {
	const {
		children,
		canvas,
		panelClassName,
		handleShowModal,
		showModal,
		disableTransition = false,
	} = props;
	const [showCanvas, setShowCanvas] = useState(false);

	const handleShowCanvas = () => setShowCanvas(prev => !prev);

	const resolvedShowModal = !canvas || (canvas && showCanvas);

	if (disableTransition) {
		return (
			<Dialog as='div' className='relative z-10' open={showModal} onClose={handleShowModal}>
				<div className='fixed inset-0 bg-black-faded backdrop-blur-sm' />
				<div className='fixed inset-0'>
					<div
						className={cn('flex h-screen items-center justify-center', {
							'p-3 sm:p-12': canvas,
						})}
					>
						<Dialog.Panel
							className={cn(
								'mx-5 w-full max-w-screen-2xl transform rounded-xl bg-cloud-primary text-left align-middle shadow-md transition-all',
								panelClassName,
							)}
						>
							{resolvedShowModal ? children : null}
						</Dialog.Panel>
					</div>
				</div>
			</Dialog>
		);
	}

	return (
		<Transition
			show={showModal}
			as={Fragment}
			afterEnter={handleShowCanvas}
			afterLeave={handleShowCanvas}
		>
			<Dialog as='div' className='relative z-10' onClose={handleShowModal}>
				<Transition.Child
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='fixed inset-0 bg-black-faded backdrop-blur-sm' />
				</Transition.Child>
				<div className='fixed inset-0'>
					<div
						className={cn('flex h-screen items-center justify-center', {
							'p-3 sm:p-12': canvas,
						})}
					>
						<Transition.Child
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 scale-95'
							enterTo='opacity-100 scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 scale-100'
							leaveTo='opacity-0 scale-95'
						>
							<Dialog.Panel
								className={cn(
									'mx-5 w-full max-w-screen-2xl transform rounded-xl bg-cloud-primary text-left align-middle shadow-md transition-all',
									panelClassName,
								)}
							>
								{resolvedShowModal ? children : null}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default Modal;
