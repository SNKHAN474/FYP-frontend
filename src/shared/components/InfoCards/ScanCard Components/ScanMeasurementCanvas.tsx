import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Point } from '../../../utils/useMeasurement';

interface Props {
	imageUrl: string | null;
	width: number;
	height: number;
	points: Point[];
	onClick: (x: number, y: number) => void;
	temperatureC?: number | null;
}

function tempToRgba(tempC: number, alpha = 0.5): string {
	const t = Math.min(1, Math.max(0, (tempC - 30) / 12));
	let r: number, g: number, b: number;
	if (t < 0.5) {
		const s = t / 0.5;
		r = Math.round(255 * s);
		g = Math.round(255 * s);
		b = Math.round(255 * (1 - s));
	} else {
		const s = (t - 0.5) / 0.5;
		r = 255;
		g = Math.round(255 * (1 - s));
		b = 0;
	}
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawLegend(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
	const barW = 120;
	const barH = 12;
	const x = canvasWidth - barW - 16;
	const y = canvasHeight - 44;

	const grad = ctx.createLinearGradient(x, y, x + barW, y);
	grad.addColorStop(0, 'rgba(0,0,255,0.85)');
	grad.addColorStop(0.5, 'rgba(255,255,0,0.85)');
	grad.addColorStop(1, 'rgba(255,0,0,0.85)');

	ctx.save();
	ctx.shadowColor = 'rgba(0,0,0,0.4)';
	ctx.shadowBlur = 4;
	ctx.fillStyle = 'rgba(0,0,0,0.55)';
	ctx.beginPath();
	ctx.roundRect(x - 8, y - 6, barW + 16, barH + 28, 6);
	ctx.fill();
	ctx.restore();

	ctx.fillStyle = grad;
	ctx.fillRect(x, y, barW, barH);

	ctx.fillStyle = 'white';
	ctx.font = 'bold 10px monospace';
	ctx.textAlign = 'left';
	ctx.fillText('30°C', x, y + barH + 14);
	ctx.textAlign = 'center';
	ctx.fillText('36°C', x + barW / 2, y + barH + 14);
	ctx.textAlign = 'right';
	ctx.fillText('42°C', x + barW, y + barH + 14);
}

const ScanMeasurementCanvas = forwardRef<HTMLCanvasElement, Props>(
	({ imageUrl, width, height, points, onClick, temperatureC }, ref) => {
		const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);

		// Expose the internal canvas to the parent via forwardRef[cite: 1]
		useImperativeHandle(ref, () => internalCanvasRef.current!);

		useEffect(() => {
			const canvas = internalCanvasRef.current;
			if (!canvas || !imageUrl) return;

			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (!ctx) return;

			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(img, 0, 0, width, height);

				if (points.length > 0) {
					if (temperatureC !== null && temperatureC !== undefined && points.length > 2) {
						const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
						const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
						const maxR = Math.max(...points.map(p => Math.hypot(p.x - cx, p.y - cy))) * 1.6;

						const radialGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
						radialGrad.addColorStop(0, tempToRgba(temperatureC, 0.65));
						radialGrad.addColorStop(0.55, tempToRgba(temperatureC, 0.35));
						radialGrad.addColorStop(1, tempToRgba(temperatureC, 0));

						ctx.save();
						ctx.beginPath();
						ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
						ctx.clip();
						ctx.fillStyle = radialGrad;
						ctx.fill();
						ctx.restore();

						ctx.beginPath();
						points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
						ctx.closePath();
						ctx.fillStyle = tempToRgba(temperatureC, 0.55);
						ctx.fill();

						ctx.strokeStyle = tempToRgba(temperatureC, 0.95);
						ctx.lineWidth = 2.5;
						ctx.stroke();

						const labelText = `${temperatureC.toFixed(1)}°C`;
						ctx.font = 'bold 15px monospace';
						const tw = ctx.measureText(labelText).width;
						ctx.fillStyle = 'rgba(0,0,0,0.55)';
						ctx.fillRect(cx - tw / 2 - 5, cy - 12, tw + 10, 20);
						ctx.fillStyle = 'white';
						ctx.textAlign = 'center';
						ctx.fillText(labelText, cx, cy + 4);
						ctx.textAlign = 'left';
						drawLegend(ctx, width, height);
					} else {
						ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
						ctx.strokeStyle = 'red';
						ctx.lineWidth = 2;
						ctx.beginPath();
						points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
						if (points.length > 2) ctx.closePath();
						ctx.fill();
						ctx.stroke();
					}

					points.forEach((p, i) => {
						ctx.beginPath();
						ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
						ctx.fillStyle = temperatureC != null ? tempToRgba(temperatureC, 1) : 'red';
						ctx.fill();
						ctx.strokeStyle = 'white';
						ctx.lineWidth = 1.5;
						ctx.stroke();
						ctx.fillStyle = 'white';
						ctx.font = 'bold 9px monospace';
						ctx.textAlign = 'center';
						ctx.fillText(String(i + 1), p.x, p.y - 7);
						ctx.textAlign = 'left';
					});
				}
			};
			img.src = imageUrl;
		}, [imageUrl, points, width, height, temperatureC]);

		const handleClick = (e: React.MouseEvent) => {
			const canvas = internalCanvasRef.current!;
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
					ref={internalCanvasRef}
					width={width}
					height={height}
					onClick={handleClick}
					className='border-gray-300 block h-full w-full cursor-crosshair border'
				/>
			</div>
		);
	},
);

export default ScanMeasurementCanvas;
