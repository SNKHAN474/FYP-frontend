import React from 'react';
import ScanMeasurementCanvas from './ScanMeasurementCanvas';
import { generateVertices, downloadPLY } from '../../../utils/plyUtils';
import { useMeasurement } from '../../../utils/useMeasurement';

interface Props {
	rgbUrl: string | null;
	depthData: Uint16Array | null;
	width: number;
	height: number;
}

const ScanMeasurementAnd3D: React.FC<Props> = ({ rgbUrl, depthData, width, height }) => {
	const { points, addPoint, reset, calculate, result } = useMeasurement(width, height, depthData);

	const handleExport = () => {
		if (!depthData || points.length < 3) return;
		const vertices = generateVertices(points, depthData, width);
		downloadPLY(vertices);
	};

	return (
		<div>
			<ScanMeasurementCanvas
				imageUrl={rgbUrl}
				width={width}
				height={height}
				points={points}
				onClick={addPoint}
			/>

			<div style={{ marginTop: 10 }}>
				<button onClick={calculate}>Calculate</button>
				<button onClick={handleExport}>Export 3D</button>
				<button onClick={reset}>Reset</button>
			</div>

			{result && (
				<div>
					<p>Area (rough): {result.area}</p>
					<p>Points: {result.count}</p>
				</div>
			)}
		</div>
	);
};

export default ScanMeasurementAnd3D;
