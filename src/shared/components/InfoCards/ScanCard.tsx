import React, { useState, useEffect, useRef } from 'react';
import UploadScanDataButton from '../UploadScanDataButton';
import ScanViewer3D from './ScanCard Components/ScanViewer3D';
import { ScanEmptyState } from './ScanCard Components/ScanEmptyState';
import { useMeasurement } from '../../utils/useMeasurement';
import { useAutoSegment } from '../../utils/useAuthoSegment';
import { generateVertices, downloadPLY } from '../../utils/plyUtils';
import ScanMeasurementCanvas from './ScanCard Components/ScanMeasurementCanvas';
import GradingForm from './ScanCard Components/GradingForm';
import ScanSelector from './ScanCard Components/ScanSelector';

interface ScanFile {
	url: string;
	publicId?: string;
}

interface Scan {
	_id: string;
	patientId: string;
	ulcerId?: string;
	created?: string;
	ply?: ScanFile;
	rgb?: ScanFile;
	rgbd?: ScanFile;
	rgbdRaw?: ScanFile;
	patientComments?: string;
	glucoseLiveReadings?: number;
}

interface ScanCardProps {
	scans: Scan[];
	patientId: string;
	selectedUlcerId: string;
}

const SERVER_URL = 'http://localhost:3000';

const ScanCard: React.FC<ScanCardProps> = ({ scans, patientId, selectedUlcerId }) => {
	const [selectedScanId, setSelectedScanId] = useState<string>(() =>
		scans.length > 0 ? String(scans[0]._id) : '',
	);
	const [selectedAnnotationId, setSelectedAnnotationId] = useState<string>('');
	const [fetchedScan, setFetchedScan] = useState<Scan | null>(null);

	const [rgbUrl, setRgbUrl] = useState<string | null>(null);
	const [depthUrl, setDepthUrl] = useState<string | null>(null);
	const [depthData, setDepthData] = useState<Uint16Array | null>(null);

	const [activeView, setActiveView] = useState<'rgb' | 'depth' | '3d'>('rgb');
	const [isLoading, setIsLoading] = useState(false);
	const [isGrading, setIsGrading] = useState(false);
	const [isDetecting, setIsDetecting] = useState(false);

	const prevUlcerRef = useRef<string>('');
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const { points, setPoints, addPoint, reset, calculate, result, setResult } = useMeasurement(
		848,
		480,
		depthData,
	);

	// Wire up the auto-segmentation hook
	const { segmentImage } = useAutoSegment(canvasRef);

	useEffect(() => {
		const ulcerChanged = prevUlcerRef.current !== selectedUlcerId;
		prevUlcerRef.current = selectedUlcerId;

		if (ulcerChanged) {
			setSelectedScanId(scans.length > 0 ? String(scans[0]._id) : '');
			reset();
			setResult(null);
			setIsGrading(false);
			setSelectedAnnotationId('');
		} else {
			if (scans.length > 0) {
				const isValid = scans.some(s => String(s._id) === String(selectedScanId));
				if (!isValid || !selectedScanId) {
					setSelectedScanId(String(scans[0]._id));
				}
			} else {
				setSelectedScanId('');
			}
		}
	}, [scans, selectedUlcerId]);

	const selectedScan =
		scans.find(scan => String(scan._id) === String(selectedScanId)) ?? fetchedScan;

	const handleScanSelect = (annotationId: string, scanId: string) => {
		console.log('🔀 handleScanSelect called:', { annotationId, scanId });
		console.log(
			'📦 scans available:',
			scans.map(s => s._id),
		);
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

	// LOAD MEDIA (CLOUDINARY)
	useEffect(() => {
		if (!selectedScanId) return;

		const knownScan = scans.find(s => String(s._id) === String(selectedScanId));

		const loadMedia = (scan: Scan) => {
			console.log('🔍 loadMedia called');
			console.log('  rgbd:', scan.rgbd);
			console.log('  rgbdRaw:', scan.rgbdRaw);

			setRgbUrl(scan.rgb?.url || null);

			if (scan.rgbd?.url) {
				setDepthUrl(scan.rgbd.url);
			}

			if (scan.rgbdRaw?.url) {
				fetch(scan.rgbdRaw.url)
					.then(res => res.arrayBuffer())
					.then(buffer => setDepthData(new Uint16Array(buffer)))
					.catch(err => {
						console.error('Depth fetch failed:', err);
						setDepthData(null);
					});
			} else {
				setDepthData(null);
			}
		};

		setIsLoading(true);

		if (knownScan) {
			loadMedia(knownScan);
			setIsLoading(false);
		} else {
			fetch(`${SERVER_URL}/scans/${selectedScanId}`)
				.then(res => {
					if (!res.ok) throw new Error('Scan not found');
					return res.json();
				})
				.then((fetchedScan: Scan) => {
					console.log('fetched scan rgbd:', fetchedScan.rgbd);
					loadMedia(fetchedScan);
					setFetchedScan(fetchedScan);
				})
				.catch(err => {
					console.error('Failed to fetch scan:', err);
					setRgbUrl(null);
					setDepthUrl(null);
					setDepthData(null);
				})
				.finally(() => setIsLoading(false));
		}
	}, [selectedScanId]);

	// LOAD ANNOTATION
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
				if (annotation.measurements) {
					setResult({
						...annotation.measurements,
						grading: annotation.grading ?? null,
					});
				} else {
					setResult(null);
				}
			} catch (err) {
				console.error('Failed to load annotation', err);
				reset();
				setResult(null);
			}
		};

		fetchAnnotation();
	}, [selectedAnnotationId]);

	const handleAutoDetect = async () => {
		if (isDetecting || activeView !== 'rgb') return;

		setIsDetecting(true);
		try {
			// 1. Get coordinates from the Vision model via the hook
			const detection = await segmentImage();

			// 2. Map the results to the measurement points state
			if (detection.ulcer && detection.ulcer.length > 0) {
				setPoints(detection.ulcer);
				console.log('✦ Auto-detection successful:', detection.ulcer.length, 'points found.');

				// Optional: If you want to automatically trigger the calculation after detection:
				// const res = calculate();
				// if (res) setIsGrading(true);
			} else {
				alert("Gemini couldn't clearly identify the wound boundary. Please try manual plotting.");
			}

			if (detection.coin && detection.coin.length > 0) {
				console.log('✦ Calibration coin detected:', detection.coin);
			}
		} catch (error) {
			console.error('Auto-detect error:', error);
			alert('Failed to reach the detection service.');
		} finally {
			setIsDetecting(false);
		}
	};

	const handleFinalSave = async (
		manualScores: any,
		finalGrade: number,
		nextVisit: string,
		ulcerId: string,
		glucoseReading: string,
		comments: string,
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
			grading: {
				totalGrade: finalGrade,
				manualScores,
				glucoseReading,
				comments,
			},
			nextVisit: formatDateToDB(nextVisit),
			lastVisit: todayFormatted,
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

			{/* HEADER SECTION */}
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
					<UploadScanDataButton patientId={patientId} ulcerId={selectedUlcerId} />
				</div>
			</div>

			<div className='bg-slate-50 rounded-lg p-6'>
				{/* VIEW SELECTOR */}
				<div className='mb-4 flex gap-2'>
					{(['rgb', 'depth', '3d'] as const).map(view => (
						<button
							key={view}
							onClick={() => setActiveView(view)}
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

				{/* MAIN VIEWER AREA */}
				{activeView === '3d' ? (
					selectedScan?.ply?.url ? (
						<div className='h-[480px] w-full'>
							<ScanViewer3D
								plyPath={selectedScan.ply.url}
								autoCenter
								onClose={() => setActiveView('rgb')}
							/>
						</div>
					) : (
						<div className='border-gray-200 text-gray-400 bg-white flex h-[480px] items-center justify-center rounded-lg border-2 border-dashed'>
							No 3D data available
						</div>
					)
				) : (
					<div className='bg-white relative overflow-hidden rounded-lg shadow-inner'>
						{/* Asset Loading Overlay */}
						{isLoading && (
							<div className='bg-white/50 absolute inset-0 z-10 flex items-center justify-center'>
								<span className='text-blue-600 animate-pulse font-semibold'>Loading Assets...</span>
							</div>
						)}

						{/* AI DETECTION OVERLAY */}
						{isDetecting && (
							<div className='bg-white/70 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]'>
								<div className='flex flex-col items-center gap-2'>
									<div className='border-purple-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
									<span className='text-purple-600 animate-pulse text-lg font-semibold'>
										✦ Analysing wound region…
									</span>
									<span className='text-purple-400 text-xs'>
										Gemini 3 Flash is detecting the boundary
									</span>
								</div>
							</div>
						)}

						<ScanMeasurementCanvas
							ref={canvasRef}
							imageUrl={activeView === 'rgb' ? rgbUrl : depthUrl}
							width={848}
							height={480}
							points={points}
							onClick={addPoint}
							temperatureC={result?.temperature ?? null}
						/>
					</div>
				)}

				{/* ACTION BUTTONS */}
				{activeView !== '3d' && (
					<div className='mt-4 flex items-center gap-2'>
						<button
							className='bg-blue-600 text-white hover:bg-blue-700 rounded px-6 py-2 font-bold shadow-md transition disabled:opacity-50'
							disabled={points.length < 3 || isDetecting}
							onClick={() => {
								const res = calculate();
								if (res) setIsGrading(true);
							}}
						>
							Calculate & Grade
						</button>

						<button
							className='bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded border px-4 py-2 text-sm transition'
							disabled={!depthData || points.length < 3}
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
							disabled={isDetecting}
						>
							Reset Points
						</button>
					</div>
				)}

				{/* RESULTS PANEL */}
				{result && activeView !== '3d' && (
					<div className='border-blue-400 bg-blue-50 mt-4 rounded-r-md border-l-4 py-3 pl-4 text-sm animate-in fade-in slide-in-from-left-2'>
						<div className='grid grid-cols-2 gap-2'>
							<p className='text-gray-600'>
								Calculated Area:{' '}
								<strong className='text-blue-700'>{result.area.toFixed(2)} mm²</strong>
							</p>
							<p className='text-gray-600'>
								Wound Depth:{' '}
								<strong className='text-blue-700'>
									{result.avgDepth?.toFixed(2) || '0.00'} mm
								</strong>
							</p>
							<p className='text-gray-400 self-end text-[10px]'>
								Data based on {result.pixelCount} points
							</p>
						</div>
					</div>
				)}

				{/* FOOTER DATA */}
				<div className='border-gray-200 text-slate-700 mt-6 grid grid-cols-2 gap-6 border-t pt-6 text-sm'>
					<div>
						<p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest'>
							{result?.grading?.glucoseReading != null
								? 'Glucose (Annotated)'
								: 'Glucose Live Reading'}
						</p>
						<p className='text-slate-800 text-lg font-semibold'>
							{result?.grading?.glucoseReading ?? selectedScan?.glucoseLiveReadings ?? '--'}{' '}
							<span className='text-gray-400 text-xs font-normal'>mmol/L</span>
						</p>
					</div>
					<div>
						<p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest'>
							Clinician Comments
						</p>
						<p className='text-slate-600 text-sm italic leading-relaxed'>
							"{result?.grading?.comments || selectedScan?.patientComments || '—'}"
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ScanCard;
