import React, { useEffect, useRef } from 'react';
import { Point } from '../../../utils/useMeasurement';

interface Props {
	imageUrl: string | null;
	width: number;
	height: number;
	points: Point[];
	onClick: (x: number, y: number) => void;
}

const ScanMeasurementCanvas: React.FC<Props> = ({ imageUrl, width, height, points, onClick }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !imageUrl) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(img, 0, 0, width, height);

			if (points.length > 0) {
				// 🔴 Filled polygon
				ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
				ctx.strokeStyle = 'red';
				ctx.lineWidth = 2;

				ctx.beginPath();
				points.forEach((p, i) => {
					if (i === 0) ctx.moveTo(p.x, p.y);
					else ctx.lineTo(p.x, p.y);
				});

				if (points.length > 2) ctx.closePath();

				ctx.fill();
				ctx.stroke();

				// 🔴 Points
				points.forEach(p => {
					ctx.fillStyle = 'red';
					ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
				});
			}
		};

		img.src = imageUrl;
	}, [imageUrl, points, width, height]);

	const handleClick = (e: React.MouseEvent) => {
		const canvas = canvasRef.current!;
		const rect = canvas.getBoundingClientRect();

		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const x = Math.floor((e.clientX - rect.left) * scaleX);
		const y = Math.floor((e.clientY - rect.top) * scaleY);

		onClick(x, y);
	};

	return (
		<div className='h-[480px] w-full overflow-hidden rounded-lg'>
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				onClick={handleClick}
				className='border-gray-300 block h-full w-full cursor-crosshair border'
			/>
		</div>
	);
};

export default ScanMeasurementCanvas;
