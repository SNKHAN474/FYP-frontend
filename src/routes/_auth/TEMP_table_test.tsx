import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import DashboardHeader from '../../shared/components/DashboardHeader';
import PatientsTableFilters from '../../shared/components/PatientTableFilters';
import { usePatientsFilter } from '../../shared/components/usePatientsFilter';

// Live Data Components (New Schema)
import { mapPatientsToTable } from '../../shared/components/Schema_stuff/PatientsList';
import { PatientTable } from '../../shared/components/Schema_stuff/PatientTableNew';
import CreateNewPatientButton from '../../shared/components/CreateNewPatientButton';

import { ScanStatusPieChart, UlcerGradeDoughnut } from '../../shared/components/Charts';
import {
	TotalPatientsCard,
	TotalUlcersCard,
	TotalScansCard,
	HighGradeUlcersCard,
} from '../../shared/components/InfoCards/InfoCards';

const Dashboard = () => {
	const [activeView, setActiveView] = useState(0);
	const { user, patients } = Route.useLoaderData();

	// Filter & Sort States
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [ulcerGradeFilter, setUlcerGradeFilter] = useState('');
	const [sortBy, setSortBy] = useState('name');

	// Logic for Overview: Hard-filtered to "Warning"
	const warningPatientsRaw = (patients || []).filter(
		p => p['Personal Details']?.Status === 'Warning',
	);

	// Apply the Hook
	const filteredWarningPatients = usePatientsFilter(warningPatientsRaw, '', '', '', 'name'); // Overview usually stays static
	const filteredFullPatients = usePatientsFilter(
		patients || [],
		searchTerm,
		statusFilter,
		ulcerGradeFilter,
		sortBy,
	);

	// Map to Table Format
	const overviewTableData = mapPatientsToTable(filteredWarningPatients);
	const fullTableData = mapPatientsToTable(filteredFullPatients);

	return (
		<div className='flex min-h-screen flex-col'>
			<DashboardHeader activeView={activeView} setActiveView={setActiveView} user={user} />

			<div className='flex-1 bg-[#EBF1F2]'>
				<main className='px-4 py-8 sm:px-8 md:px-12 lg:px-20 xl:px-40'>
					{/* VIEW 0: OVERVIEW (Clean, no filters) */}
					{activeView === 0 && (
						<div className='space-y-6'>
							<header>
								<h2 className='text-gray-800 text-2xl font-bold sm:text-3xl'>Overview</h2>
							</header>

							{/* Main 3-Column Layout for Desktop */}
							<div className='grid grid-cols-1 gap-8 lg:grid-cols-4 lg:items-start'>
								{/* LEFT COLUMN: Ulcer Grade Doughnut */}
								<div className='flex justify-center lg:col-span-1'>
									<UlcerGradeDoughnut patients={patients} />
								</div>

								{/* MIDDLE COLUMN: Stacked Stats Cards */}
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2'>
									<TotalPatientsCard patients={patients} />
									<TotalUlcersCard patients={patients} />
									<TotalScansCard patients={patients} />
									<HighGradeUlcersCard patients={patients} />
								</div>

								{/* RIGHT COLUMN: Scan Status Pie Chart */}
								<div className='flex justify-center lg:col-span-1'>
									<ScanStatusPieChart patients={patients} />
								</div>
							</div>

							<div className='bg-white rounded-xl p-6 shadow-sm'>
								<p className='text-red-600 font-medium'>
									Action Required: Showing {filteredWarningPatients.length} patients with Warning
									status.
								</p>
								<PatientTable data={overviewTableData} />
							</div>
						</div>
					)}

					{/* VIEW 1: FULL PATIENTS LIST */}
					{activeView === 1 && (
						<div className='space-y-6'>
							<header>
								<h2 className='text-gray-800 text-2xl font-bold sm:text-3xl'>Patient Directory</h2>
							</header>

							{/* Updated Filter Wrapper */}
							<div className='border-gray-100 rounded-xl bg-white-primary shadow-sm'>
								<PatientsTableFilters
									searchTerm={searchTerm}
									setSearchTerm={setSearchTerm}
									statusFilter={statusFilter}
									setStatusFilter={setStatusFilter}
									ulcerGradeFilter={ulcerGradeFilter}
									setUlcerGradeFilter={setUlcerGradeFilter}
									sortBy={sortBy}
									setSortBy={setSortBy}
								/>
							</div>

							<CreateNewPatientButton />
							<div className='bg-white p-6 shadow-sm'>
								<PatientTable data={fullTableData} />
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export const Route = createFileRoute('/_auth/TEMP_table_test')({
	component: Dashboard,
	loader: async ({ context }) => {
		try {
			const response = await fetch('http://localhost:3000/patients');
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const patientsData = await response.json();
			return { user: context.user, patients: patientsData };
		} catch (error) {
			console.error('Failed to load patients:', error);
			return { user: context.user, patients: [] };
		}
	},
});
