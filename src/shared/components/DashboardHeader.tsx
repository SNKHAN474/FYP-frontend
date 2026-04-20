import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import TashaLogo from '../components/NewTashaLogo';
import { Button } from '../components/Button';
import { Menu, X } from 'lucide-react';
import { User } from '../../types/UserTypes';

type DashboardHeaderProps = {
	activeView: number;
	setActiveView: (index: number) => void;
	user?: User;
};

const DashboardHeader = ({ activeView, setActiveView, user }: DashboardHeaderProps) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const navigate = useNavigate(); // Initialize navigate

	// Shared logic for navigation
	const handleNavigation = (index: number) => {
		setActiveView(index);
		setIsMobileMenuOpen(false);
		navigate({ to: '/TEMP_table_test' });
	};

	const displayName =
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.email
				? user.email.split('@')[0]
				: 'Dr Alex Long';

	const displayRole = user?.jobRole || 'WIP';

	return (
		<>
			<header className='relative z-30 flex items-center bg-white-primary px-4 py-4 shadow-sm sm:px-8 md:px-12 lg:px-20 xl:px-40'>
				{/* Mobile Logo & Hamburger */}
				<div className='flex items-center lg:hidden'>
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className='mr-3 p-2 focus:outline-none'
						aria-label='Toggle menu'
					>
						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
					<div className='flex-shrink-0'>
						<TashaLogo />
					</div>
				</div>

				{/* Desktop Logo */}
				<div className='hidden flex-shrink-0 lg:block'>
					<TashaLogo />
				</div>

				{/* Desktop Navigation */}
				<div className='absolute left-1/2 hidden -translate-x-1/2 space-x-4 lg:flex'>
					<Button
						variant={activeView === 0 ? 'teal' : 'null'}
						className={
							activeView === 0 ? 'border-b-2 border-[#0C5E6A]' : 'border-b-2 border-transparent'
						}
						onClick={() => handleNavigation(0)}
					>
						Overview
					</Button>

					<Button
						variant={activeView === 1 ? 'teal' : 'null'}
						className={
							activeView === 1 ? 'border-b-2 border-[#0C5E6A]' : 'border-b-2 border-transparent'
						}
						onClick={() => handleNavigation(1)}
					>
						Patients
					</Button>
				</div>

				{/* User Info */}
				<div className='ml-auto flex flex-col items-end text-right'>
					<span className='text-gray-700 font-medium'>{displayName}</span>
					<span className='text-gray-500 text-sm'>{displayRole}</span>
				</div>
			</header>

			{/* Mobile Overlay */}
			{isMobileMenuOpen && (
				<div
					className='bg-black fixed inset-0 z-40 bg-opacity-50 lg:hidden'
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile Drawer */}
			<div
				className={`
          fixed left-0 top-0 z-50 h-screen w-64 transform bg-white-primary
          shadow-xl transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:hidden
        `}
			>
				<div className='border-gray-200 flex items-center justify-between border-b p-4'>
					<span className='text-lg font-bold'>Menu</span>
					<button onClick={() => setIsMobileMenuOpen(false)} className='p-1'>
						<X size={20} />
					</button>
				</div>

				<div className='p-4'>
					<nav className='space-y-2'>
						<button
							onClick={() => handleNavigation(0)}
							className={`w-full rounded-lg p-3 text-left transition-colors ${
								activeView === 0
									? 'bg-teal-50 text-teal-700 border-teal-600 border-l-4 font-medium'
									: 'text-gray-700 hover:bg-gray-50'
							}`}
						>
							Overview
						</button>

						<button
							onClick={() => handleNavigation(1)}
							className={`w-full rounded-lg p-3 text-left transition-colors ${
								activeView === 1
									? 'bg-teal-50 text-teal-700 border-teal-600 border-l-4 font-medium'
									: 'text-gray-700 hover:bg-gray-50'
							}`}
						>
							Patients
						</button>
					</nav>
				</div>
			</div>
		</>
	);
};

export default DashboardHeader;
