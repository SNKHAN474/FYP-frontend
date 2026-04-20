import React, { useEffect, useState } from 'react';

interface Annotation {
	_id: string;
	scanId: string;
	ulcerId: string;
	createdAt?: string;
	grading?: { totalGrade?: number };
}

interface ScanSelectorProps {
	selectedUlcerId: string;
	selectedAnnotationId: string;
	onChange: (annotationId: string, scanId: string) => void;
}

const SERVER_URL = 'http://localhost:3000';

const ScanSelector: React.FC<ScanSelectorProps> = ({
	selectedUlcerId,
	selectedAnnotationId,
	onChange,
}) => {
	const [annotations, setAnnotations] = useState<Annotation[]>([]);

	useEffect(() => {
		if (!selectedUlcerId) return;
		let cancelled = false;

		const fetchAnnotations = async () => {
			try {
				const res = await fetch(`${SERVER_URL}/annotations/ulcer/${selectedUlcerId}`);
				if (!res.ok) return;
				const data: Annotation[] = await res.json();
				if (!cancelled) {
					const sorted = [...data].sort(
						(a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
					);
					setAnnotations(sorted);
				}
			} catch (err) {
				console.error('Failed to fetch annotations for selector', err);
			}
		};

		fetchAnnotations();
		return () => {
			cancelled = true;
		};
	}, [selectedUlcerId]);

	// Auto-select first annotation when list loads or ulcer changes
	useEffect(() => {
		if (annotations.length === 0) return;
		const isValid = annotations.some(a => a._id === selectedAnnotationId);
		if (!isValid) {
			const first = annotations[0];
			onChange(first._id, first.scanId);
		}
	}, [annotations]);

	const getLabel = (annotation: Annotation, index: number) => {
		const date = annotation.createdAt
			? new Date(annotation.createdAt).toLocaleDateString('en-GB', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})
			: `Attempt ${index + 1}`;

		const grade = annotation.grading?.totalGrade;
		const gradeLabel = grade !== undefined && grade !== null ? `[Grade ${grade}]` : '[Ungraded]';

		return `${date} ${gradeLabel}`;
	};

	if (annotations.length === 0) {
		return (
			<select
				disabled
				className='border-gray-200 bg-gray-50 rounded-md border px-3 py-1.5 text-sm font-medium opacity-50'
			>
				<option>No annotations yet</option>
			</select>
		);
	}

	return (
		<select
			className='border-gray-200 bg-gray-50 focus:ring-blue-500 rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2'
			value={selectedAnnotationId}
			onChange={e => {
				const annotation = annotations.find(a => a._id === e.target.value);
				if (annotation) onChange(annotation._id, annotation.scanId);
			}}
		>
			{annotations.map((annotation, index) => (
				<option key={annotation._id} value={annotation._id}>
					{getLabel(annotation, index)}
				</option>
			))}
		</select>
	);
};

export default ScanSelector;
