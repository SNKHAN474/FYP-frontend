import React, { useState } from 'react';

interface Note {
	_id: string;
	patientID: string;
	content?: string;
	noteBody?: string;
	date?: string;
	isPlaceHolder?: boolean;
}

interface NoteCardProps {
	patientId: string;
	initialNotes: Note[];
}

export const NotesCard: React.FC<NoteCardProps> = ({ patientId, initialNotes }) => {
	const [notes, setNotes] = useState(initialNotes);
	const [isAdding, setIsAdding] = useState(false);
	const [newNoteContent, setNewNoteContent] = useState('');
	const [showSuccess, setShowSuccess] = useState(false);

	const handleAddNote = async () => {
		if (!newNoteContent.trim()) return;

		try {
			const res = await fetch('http://localhost:3000/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					patientId: patientId,
					content: newNoteContent, // Matches your fixed schema
					date: new Date().toISOString(),
				}),
			});

			if (res.ok) {
				const savedNote = await res.json();
				setNotes(prev => [savedNote, ...prev.filter(n => !n.isPlaceHolder)]);
				setNewNoteContent('');
				setIsAdding(false);
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 3000);
			}
		} catch (error) {
			console.error('Fetch error:', error);
		}
	};

	return (
		<div className='w-full rounded-2xl bg-white-primary p-6 shadow-sm'>
			<div className='mb-6 flex items-center justify-between'>
				<h3 className='text-slate-800 text-lg font-semibold'>Notes</h3>
				{showSuccess && (
					<span className='text-teal-600 text-sm font-medium duration-300 animate-in fade-in zoom-in'>
						✓ Note added
					</span>
				)}
			</div>

			{/* SCROLL LOGIC: 
          max-h-[380px] is approximately the height of 3 standard notes.
          overflow-y-auto enables the scrollbar when content exceeds this height.
      */}
			<div className='custom-scrollbar mb-6 max-h-[380px] space-y-4 overflow-y-auto pr-3'>
				{notes.length === 0 || (notes.length === 1 && notes[0].isPlaceHolder) ? (
					<div className='border-gray-200 bg-gray-50 rounded-lg border border-dashed p-8 text-center'>
						<p className='text-gray-400 text-sm italic'>No notes found for this patient.</p>
					</div>
				) : (
					notes.map(note => (
						<div
							key={note._id}
							className='border-teal-500 bg-slate-50 rounded-lg border-l-4 p-4 shadow-sm'
						>
							<div className='mb-2 flex items-start justify-between'>
								<span className='text-slate-400 text-[10px] font-bold uppercase'>
									{note.date ? new Date(note.date).toLocaleDateString('en-GB') : 'Recent'}
								</span>
							</div>
							<p className='text-slate-700 text-sm leading-relaxed'>
								{note.content || note.noteBody}
							</p>
						</div>
					))
				)}
			</div>

			{/* Input Section */}
			{isAdding ? (
				<div className='border-t pt-6 duration-300 animate-in fade-in slide-in-from-bottom-2'>
					<textarea
						autoFocus
						className='border-gray-200 bg-gray-50 focus:border-teal-500 w-full rounded-lg border p-3 text-sm transition focus:outline-none'
						placeholder='Enter clinical observation...'
						rows={3}
						value={newNoteContent}
						onChange={e => setNewNoteContent(e.target.value)}
					/>
					<div className='mt-3 flex gap-3'>
						<button
							onClick={handleAddNote}
							className='bg-teal-600 text-white hover:bg-teal-700 flex-1 rounded-lg py-2 text-sm font-semibold shadow-sm transition'
						>
							Submit Note
						</button>
						<button
							onClick={() => {
								setIsAdding(false);
								setNewNoteContent('');
							}}
							className='border-gray-200 text-slate-500 hover:bg-gray-50 rounded-lg border px-4 py-2 text-sm font-medium transition'
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<button
					onClick={() => setIsAdding(true)}
					className='text-red-500 hover:bg-red-50 w-fit rounded-md border border-solid border-red-primary px-4 py-1.5 text-xs font-medium transition-colors'
				>
					Add a note +
				</button>
			)}
		</div>
	);
};
