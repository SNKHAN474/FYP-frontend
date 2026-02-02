import React, { useState } from 'react';
import DashboardHeader from '../../shared/components/DashboardHeader';
import PatientsTable from '../../shared/components/PatientsTable';
import PatientsCards from '../../shared/components/PatientsCard';
import PatientsTableFilters from '../../shared/components/PatientTableFilters';
import { UlcerGradeDoughnut, ScanStatusPieChart } from '../../shared/components/Charts';
import {
	TotalPatientsCard,
	TotalUlcersCard,
	NewScansCard,
	TotalScansCard,
	FlaggedPatientsCard,
} from '../../shared/components/InfoCards';
import { createFileRoute } from '@tanstack/react-router';

const Dashboard = () => {
	const [activeView, setActiveView] = useState(0);
	const { user } = Route.useLoaderData();

	// Filter states - shared between table and cards
	const [statusFilter, setStatusFilter] = useState('');
	const [ulcerGradeFilter, setUlcerGradeFilter] = useState('');
	const [sortBy, setSortBy] = useState('');
	const [searchTerm, setSearchTerm] = useState('');

	// Clear all filters
	const clearFilters = () => {
		setStatusFilter('');
		setUlcerGradeFilter('');
		setSortBy('');
		setSearchTerm('');
	};

	// Check if any filter is active
	const hasActiveFilters = statusFilter || ulcerGradeFilter || searchTerm || sortBy;

	return (
		<div className='flex min-h-screen flex-col'>
			<DashboardHeader activeView={activeView} setActiveView={setActiveView} user={user} />

			<div className='flex-1 bg-[#EBF1F2]'>
				<main className='px-4 py-8 sm:px-8 md:px-12 lg:px-20 xl:px-40'>
					{activeView === 0 && (
						<div className='text-center lg:text-left'>
							<h2 className='mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl'>Overview</h2>

							{/* Charts Grid */}
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
								<div className='space-y-4 md:col-span-1'>
									<TotalPatientsCard />
									<UlcerGradeDoughnut />
								</div>

								<div className='space-y-4 md:col-span-1'>
									<FlaggedPatientsCard />
									<NewScansCard />
									<TotalUlcersCard />
									<TotalScansCard />
								</div>

								<div className='md:col-span-2 lg:col-span-1'>
									<ScanStatusPieChart />
								</div>
							</div>

							<h2 className='mb-4 mt-8 text-xl sm:text-2xl md:text-3xl lg:text-4xl'>
								Unreviewed Patients
							</h2>

							{/* Desktop Table */}
							<div className='hidden lg:block'>
								<PatientsTable filterByScanStatus='To Review' />
							</div>

							{/* Mobile Cards with filters */}
							<PatientsCards
								filterByScanStatus='To Review'
								statusFilter={statusFilter}
								ulcerGradeFilter={ulcerGradeFilter}
								searchTerm={searchTerm}
								sortBy={sortBy}
								onPatientSelect={id => {
									window.location.href = `/patients/${id}`;
								}}
							/>
						</div>
					)}

					{activeView === 1 && (
						<div className='text-center lg:text-left'>
							<h2 className='mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl'>Patients</h2>

							{/* Mobile Filters - Show only on mobile */}
							<div className='mb-6 lg:hidden'>
								<PatientsTableFilters
									statusFilter={statusFilter}
									setStatusFilter={setStatusFilter}
									ulcerGradeFilter={ulcerGradeFilter}
									setUlcerGradeFilter={setUlcerGradeFilter}
									sortBy={sortBy}
									setSortBy={setSortBy}
									searchTerm={searchTerm}
									setSearchTerm={setSearchTerm}
								/>
								{hasActiveFilters && (
									<div className='mt-2 flex justify-end'>
										<button
											onClick={clearFilters}
											className='text-blue-600 hover:text-blue-800 text-sm'
										>
											Clear all filters
										</button>
									</div>
								)}
							</div>

							{/* Desktop Table with filters */}
							<div className='hidden lg:block'>
								<PatientsTable
									statusFilter={statusFilter}
									ulcerGradeFilter={ulcerGradeFilter}
									sortBy={sortBy}
									searchTerm={searchTerm}
								/>
							</div>

							{/* Mobile Cards with filters */}
							<PatientsCards
								statusFilter={statusFilter}
								ulcerGradeFilter={ulcerGradeFilter}
								searchTerm={searchTerm}
								sortBy={sortBy}
								onPatientSelect={id => {
									window.location.href = `/patients/${id}`;
								}}
							/>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export const Route = createFileRoute('/_auth/TEMP_toggle_test')({
	component: Dashboard,
	loader: async ({ context }) => {
		return {
			user: context.user,
		};
	},
});
