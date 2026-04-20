import React, { useState, useEffect, useRef } from 'react';
import { convertRgb8ToPngUrl, convertDepth16ToPngUrl } from '../../utils/imageUtils';
import UploadScanDataButton from '../UploadScanDataButton';
import ScanViewer3D from './ScanCard Components/ScanViewer3D';
import { ScanEmptyState } from './ScanCard Components/ScanEmptyState';
import { useMeasurement } from '../../utils/useMeasurement';
import { generateVertices, downloadPLY } from '../../utils/plyUtils';
import ScanMeasurementCanvas from './ScanCard Components/ScanMeasurementCanvas';
import GradingForm from './ScanCard Components/GradingForm';
import ScanSelector from './ScanCard Components/ScanSelector';

interface ScanFile {
	path: string;
}
interface Scan {
	_id: string;
	patientId: string;
	created?: string;
	ply?: ScanFile;
	rgb?: ScanFile;
	rgbd?: ScanFile;
	patientComments?: string;
	glucoseLiveReadings?: number;
}

interface ScanCardProps {
	scans: Scan[];
	patientId: string;
	selectedUlcerId: string;
}

const BASE_PATH = 'C:/Users/shahk/Documents/UCL/Y4/fyp/FYP/New folder';
const SERVER_URL = 'http://localhost:3000';

const ScanCard: React.FC<ScanCardProps> = ({ scans, patientId, selectedUlcerId }) => {
	const [selectedScanId, setSelectedScanId] = useState<string>(() =>
		scans.length > 0 ? String(scans[0]._id) : '',
	);
	const [selectedAnnotationId, setSelectedAnnotationId] = useState<string>('');

	const [rgbUrl, setRgbUrl] = useState<string | null>(null);
	const [depthUrl, setDepthUrl] = useState<string | null>(null);
	const [depthData, setDepthData] = useState<Uint16Array | null>(null);
	const [activeView, setActiveView] = useState<'rgb' | 'depth' | '3d'>('rgb');
	const [isLoading, setIsLoading] = useState(false);
	const [isGrading, setIsGrading] = useState(false);

	const prevUlcerRef = useRef<string>('');

	const { points, setPoints, addPoint, reset, calculate, result, setResult } = useMeasurement(
		848,
		480,
		depthData,
	);

	// 1. RESET STATE WHEN ULCER CHANGES
	useEffect(() => {
		const ulcerChanged = prevUlcerRef.current !== selectedUlcerId;
		prevUlcerRef.current = selectedUlcerId;

		if (scans.length > 0) {
			const isValid = scans.some(s => String(s._id) === String(selectedScanId));
			if (!isValid || !selectedScanId) {
				setSelectedScanId(String(scans[0]._id));
			}
		} else {
			setSelectedScanId('');
		}

		if (ulcerChanged) {
			reset();
			setResult(null);
			setIsGrading(false);
			setSelectedAnnotationId('');
		}
	}, [scans, selectedUlcerId]);

	const selectedScan = scans.find(scan => String(scan._id) === String(selectedScanId));

	const handleScanSelect = (annotationId: string, scanId: string) => {
		setSelectedAnnotationId(annotationId);
		setSelectedScanId(scanId);
	};

	const getCentroid = (pts: { x: number; y: number }[]) => {
		if (pts.length === 0) return { x: 0, y: 0 };
		const sum = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
		return { x: sum.x / pts.length, y: sum.y / pts.length };
	};

	const formatDateToDB = (dateStr: string) => {
		if (!dateStr || !dateStr.includes('-')) return dateStr;
		const [y, m, d] = dateStr.split('-');
		return `${d}/${m}/${y}`;
	};

	// 2. LOAD IMAGES & DEPTH DATA
	useEffect(() => {
		let isMounted = true;
		const activeUrls: string[] = [];

		async function processImages() {
			if (!selectedScan) {
				setRgbUrl(null);
				setDepthUrl(null);
				setDepthData(null);
				return;
			}
			setIsLoading(true);

			const fetchAndConvert = async (
				rawPath: string,
				converter: (url: string) => Promise<string>,
			) => {
				const relativePath = rawPath.replace(/\\/g, '/').split(BASE_PATH.replace(/\\/g, '/'))[1];
				const webUrl = `${SERVER_URL}/files${relativePath}`;
				const url = await converter(webUrl);
				activeUrls.push(url);
				return url;
			};

			try {
				if (selectedScan.rgb?.path) {
					const url = await fetchAndConvert(selectedScan.rgb.path, convertRgb8ToPngUrl);
					if (isMounted) setRgbUrl(url);
				}
				if (selectedScan.rgbd?.path) {
					const url = await fetchAndConvert(selectedScan.rgbd.path, convertDepth16ToPngUrl);
					if (isMounted) setDepthUrl(url);

					const relativePath = selectedScan.rgbd.path
						.replace(/\\/g, '/')
						.split(BASE_PATH.replace(/\\/g, '/'))[1];
					const res = await fetch(`${SERVER_URL}/files${relativePath}`);
					const buffer = await res.arrayBuffer();
					if (isMounted) setDepthData(new Uint16Array(buffer));
				}
			} catch (err) {
				console.error('Failed to process media:', err);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		processImages();
		return () => {
			isMounted = false;
			activeUrls.forEach(url => URL.revokeObjectURL(url));
		};
	}, [selectedScanId]);

	// 3. LOAD POINTS & MEASUREMENTS FOR SELECTED ANNOTATION
	useEffect(() => {
		if (!selectedAnnotationId) return;

		const fetchAnnotation = async () => {
			try {
				const res = await fetch(`${SERVER_URL}/annotations/ulcer/${selectedUlcerId}`);
				if (!res.ok) throw new Error('Failed to fetch');
				const data = await res.json();

				const annotation = Array.isArray(data)
					? data.find((a: any) => String(a._id) === String(selectedAnnotationId))
					: null;

				if (!annotation) {
					reset();
					setResult(null);
					return;
				}

				setPoints(annotation.points || []);
				if (annotation.measurements) setResult(annotation.measurements);
				else setResult(null);
			} catch (err) {
				console.error('Failed to load annotation', err);
				reset();
				setResult(null);
			}
		};

		fetchAnnotation();
	}, [selectedAnnotationId]);

	const handleFinalSave = async (
		manualScores: any,
		finalGrade: number,
		nextVisit: string,
		ulcerId: string,
	) => {
		if (!result || !selectedScanId) return;
		const centroid = getCentroid(points);
		const now = new Date();
		const todayFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

		const payload = {
			scanId: selectedScanId,
			patientId,
			ulcerId,
			points,
			measurements: { ...result, temperature: result.temperature || 0 },
			grading: { totalGrade: finalGrade, manualScores },
			nextVisit: formatDateToDB(nextVisit),
			lastVisit: todayFormatted,
			glucoseReading: selectedScan?.glucoseLiveReadings,
			footGraphData: {
				xCoordinate: centroid.x,
				yCoordinate: centroid.y,
				dateLogged: todayFormatted,
			},
		};

		try {
			const response = await fetch(`${SERVER_URL}/annotations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!response.ok) throw new Error('Failed to save');
			setIsGrading(false);
			alert('Annotation saved successfully!');
		} catch (err) {
			console.error('Save failed:', err);
			alert('Failed to save annotation.');
		}
	};

	if (!scans || scans.length === 0) return <ScanEmptyState patientId={patientId} />;

	return (
		<div className='w-full rounded-2xl bg-white-primary p-6 shadow-sm'>
			{isGrading && result && (
				<GradingForm
					patientId={patientId}
					ulcerId={selectedUlcerId}
					result={result}
					onSave={handleFinalSave}
					onCancel={() => setIsGrading(false)}
				/>
			)}

			<div className='mb-6 flex items-start justify-between'>
				<div>
					<h3 className='text-slate-800 text-lg font-semibold'>Ulcer Progression</h3>
					<p className='text-slate-400 font-mono text-[10px]'>Patient ID: {patientId}</p>
				</div>
				<div className='flex items-center gap-3'>
					<ScanSelector
						selectedUlcerId={selectedUlcerId}
						selectedAnnotationId={selectedAnnotationId}
						onChange={handleScanSelect}
					/>
					<UploadScanDataButton patientId={patientId} />
				</div>
			</div>

			<div className='bg-slate-50 rounded-lg p-6'>
				<div className='mb-4 flex gap-2'>
					{['rgb', 'depth', '3d'].map(view => (
						<button
							key={view}
							onClick={() => setActiveView(view as any)}
							className={`rounded px-3 py-1 text-xs font-bold uppercase tracking-wider transition ${
								activeView === view
									? 'bg-blue-600 text-white shadow-sm'
									: 'bg-gray-200 text-gray-600 hover:bg-gray-300'
							}`}
						>
							{view}
						</button>
					))}
				</div>

				{activeView === '3d' ? (
					selectedScan?.ply?.path ? (
						<div className='h-[480px] w-full'>
							<ScanViewer3D
								plyPath={selectedScan.ply.path}
								autoCenter={true}
								onClose={() => setActiveView('rgb')}
							/>
						</div>
					) : (
						<div className='border-gray-200 text-gray-400 bg-white flex h-[480px] items-center justify-center rounded-lg border-2 border-dashed'>
							No 3D data available for this session
						</div>
					)
				) : (
					<div className='bg-white relative overflow-hidden rounded-lg shadow-inner'>
						{isLoading && (
							<div className='bg-white/50 absolute inset-0 z-10 flex items-center justify-center'>
								<span className='text-blue-600 animate-pulse font-semibold'>Loading Assets...</span>
							</div>
						)}
						<ScanMeasurementCanvas
							imageUrl={activeView === 'rgb' ? rgbUrl : depthUrl}
							width={848}
							height={480}
							points={points}
							onClick={addPoint}
						/>
					</div>
				)}

				{activeView !== '3d' && (
					<div className='mt-4 flex items-center gap-2'>
						<button
							className='bg-blue-600 text-white hover:bg-blue-700 rounded px-6 py-2 font-bold shadow-md transition disabled:opacity-50'
							disabled={points.length < 3}
							onClick={() => calculate() && setIsGrading(true)}
						>
							Calculate & Grade
						</button>
						<button
							className='bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded border px-4 py-2 text-sm transition'
							onClick={() => {
								if (!depthData || points.length < 3) return;
								const vertices = generateVertices(points, depthData, 848);
								downloadPLY(vertices);
							}}
						>
							Export 3D
						</button>
						<button
							className='text-gray-400 hover:text-red-500 ml-auto text-sm transition'
							onClick={reset}
						>
							Reset Points
						</button>
					</div>
				)}

				{result && activeView !== '3d' && (
					<div className='border-blue-400 bg-blue-50 mt-4 rounded-r-md border-l-4 py-3 pl-4 text-sm animate-in fade-in slide-in-from-left-2'>
						<div className='grid grid-cols-2 gap-2'>
							<p className='text-gray-600'>
								Calculated Area:{' '}
								<strong className='text-blue-700'>{result.area.toFixed(2)} mm²</strong>
							</p>
							<p className='text-gray-600'>
								Avg Distance:{' '}
								<strong className='text-blue-700'>{result.avgDepth.toFixed(2)} mm</strong>
							</p>
							<p className='text-gray-600'>
								Wound Depth:{' '}
								<strong className='text-blue-700'>
									{result.ulcerDepth?.toFixed(2) || '0.00'} mm
								</strong>
							</p>
							<p className='text-gray-400 self-end text-[10px]'>
								Data based on {result.pixelCount} points
							</p>
						</div>
					</div>
				)}

				<div className='border-gray-200 text-slate-700 mt-6 grid grid-cols-2 gap-6 border-t pt-6 text-sm'>
					<div>
						<p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest'>
							Glucose Live Reading
						</p>
						<p className='text-slate-800 text-lg font-semibold'>
							{selectedScan?.glucoseLiveReadings ?? '--'}{' '}
							<span className='text-gray-400 text-xs font-normal'>mmol/L</span>
						</p>
					</div>
					<div>
						<p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest'>
							Clinician Comments
						</p>
						<p className='text-slate-600 text-sm italic leading-relaxed'>
							"{selectedScan?.patientComments || 'No comments provided.'}"
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ScanCard;
