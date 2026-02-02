import { type ElementRef, useRef, useState, useEffect, useLayoutEffect } from 'react';

const WIDTH_TO_HEIGHT_SCALE = 240 / 424;

const useContainerDimensions = () => {
	const containerRef = useRef<ElementRef<'div'>>(null);

	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	const handleResize = () => {
		if (!containerRef.current) return;
		const containerWidth = containerRef.current.clientWidth;
		const containerHeight = containerWidth * WIDTH_TO_HEIGHT_SCALE;

		setDimensions({
			height: containerHeight,
			width: containerWidth,
		});
	};

	useEffect(() => {
		handleResize();
	}, [containerRef.current]);

	useLayoutEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return { containerRef, dimensions };
};

export default useContainerDimensions;
