import React from 'react';

// =======================
// Reusable Wrapper
// =======================
export const InfoCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => {
	return (
		<div className='border-slate-200 flex h-[120px] w-full min-w-[200px] flex-col justify-center rounded-xl bg-white-primary p-4 shadow-sm lg:w-[338px]'>
			<h3 className='text-slate-500 text-sm font-medium uppercase tracking-wider'>{title}</h3>
			<p className='text-slate-800 mt-2 text-3xl font-bold'>{value}</p>
		</div>
	);
};

interface CardProps {
	patients: any[];
}

// =======================
// Individual Cards (Logic updated for MongoDB)
// =======================

export const TotalPatientsCard: React.FC<CardProps> = ({ patients }) => (
	<InfoCard title='Total Patients' value={patients.length} />
);

export const TotalUlcersCard: React.FC<CardProps> = ({ patients }) => {
	const totalUlcers = patients.reduce((acc, p) => acc + (p.Ulcers?.length || 0), 0);
	return <InfoCard title='Total Ulcers' value={totalUlcers} />;
};

export const TotalScansCard: React.FC<CardProps> = ({ patients }) => {
	const totalScans = patients.reduce((acc, p) => {
		// Sum up the 'NumberOfScans' field from every ulcer object
		const patientScans =
			p.Ulcers?.reduce((sum: number, u: any) => sum + (u.NumberOfScans || 0), 0) || 0;
		return acc + patientScans;
	}, 0);
	return <InfoCard title='Total Scans' value={totalScans} />;
};

export const FlaggedPatientsCard: React.FC<CardProps> = ({ patients }) => {
	// Mapping 'Warning' status as the "Flagged" criteria from your DB
	const flagged = patients.filter(p => p['Personal Details']?.Status === 'Warning').length;
	return <InfoCard title='Flagged Patients' value={flagged} />;
};

export const HighGradeUlcersCard: React.FC<CardProps> = ({ patients }) => {
	// Extra useful card: Count ulcers with Grade 4 or 5
	const highGrade = patients.reduce((acc, p) => {
		const count = p.Ulcers?.filter((u: any) => parseInt(u.UlcerGrade) >= 4).length || 0;
		return acc + count;
	}, 0);
	return <InfoCard title='Critical Ulcers (G4+)' value={highGrade} />;
};
