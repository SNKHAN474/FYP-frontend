import { useState } from 'react';

const useModal = () => {
	const [showModal, setShowModal] = useState(false);
	const [showCanvas, setShowCanvas] = useState(false);

	const handleShowModal = () => {
		setShowModal(prev => !prev);
	};

	const handleShowCanvas = () => {
		setShowCanvas(prev => !prev);
	};

	return { showModal, handleShowModal, showCanvas, handleShowCanvas };
};

export default useModal;
