import React from 'react';
import patientsData from '../../data/dummy_data.json';

// =======================
// Reusable Wrapper
// =======================
export const InfoCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<div className='flex h-[120px] w-[338px] flex-col justify-center rounded-xl border border-slate-border bg-white-primary p-4 shadow-sm'>
			{children}
		</div>
	);
};

// =======================
// Calculations
// =======================
const patients = patientsData.patients;

const totalPatients = patients.length;

const flaggedPatients = patients.filter(p => p.flag === true).length;

const totalUlcers = patients.reduce((acc, p) => {
	if (!p.ulcerGrade || p.ulcerGrade.trim() === '') return acc;
	return acc + p.ulcerGrade.split('|').filter(g => g.trim() !== '').length;
}, 0);

// Corrected logic for new scans based on dummy_data.json
const newScans = patients.filter(p => p.status?.toLowerCase() === 'new').length;

// Placeholder for total scans (implement later)
const totalScans = 'Implement logic later';

// =======================
// Individual Cards
// =======================
export const TotalPatientsCard: React.FC = () => (
	<InfoCard>
		<h3 className='text-slate-800 text-lg '>Total Patients</h3>
		<p className='text-slate-600 mt-2 text-3xl font-semibold'>{totalPatients}</p>
	</InfoCard>
);

export const TotalUlcersCard: React.FC = () => (
	<InfoCard>
		<h3 className='text-slate-800 text-lg '>Total Ulcers</h3>
		<p className='text-slate-600 mt-2 text-3xl font-semibold'>{totalUlcers}</p>
	</InfoCard>
);

export const NewScansCard: React.FC = () => (
	<InfoCard>
		<h3 className='text-slate-800 text-lg '>New Scans</h3>
		<p className='text-slate-600 mt-2 text-3xl font-semibold'>{newScans}</p>
	</InfoCard>
);

export const TotalScansCard: React.FC = () => (
	<InfoCard>
		<h3 className='text-slate-800 text-lg '>Total Scans</h3>
		<p className='text-slate-600 mt-2 text-3xl font-semibold'>{totalScans}</p>
	</InfoCard>
);

export const FlaggedPatientsCard: React.FC = () => (
	<InfoCard>
		<h3 className='text-slate-800 text-lg '>Flagged Patients</h3>
		<p className='text-slate-600 mt-2 text-3xl font-semibold'>{flaggedPatients}</p>
	</InfoCard>
);
