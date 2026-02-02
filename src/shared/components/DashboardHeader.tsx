// /src/shared/components/DashboardHeader.tsx
import React, { useState } from 'react';
import TashaLogo from '../components/NewTashaLogo';
import { Button } from '../components/Button';
import { Menu, X } from 'lucide-react';
import { User } from '../../types/UserTypes'; // Import User type

type DashboardHeaderProps = {
	activeView: number;
	setActiveView: (index: number) => void;
	user?: User; // Add user prop
};

const DashboardHeader = ({ activeView, setActiveView, user }: DashboardHeaderProps) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleViewChange = (index: number) => {
		setActiveView(index);
		setIsMobileMenuOpen(false);
	};

	// Get display name from user
	const displayName =
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.email
				? user.email.split('@')[0]
				: 'Dr Alex Long'; // Fallback

	const displayRole = user?.jobRole || 'WIP';

	return (
		<>
			<header className='relative z-30 flex items-center bg-white-primary px-4 py-4 shadow-sm sm:px-8 md:px-12 lg:px-20 xl:px-40'>
				{/* Left: Hamburger Menu (Mobile only) */}
				<div className='flex items-center lg:hidden'>
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className='mr-3 p-2 focus:outline-none'
						aria-label='Toggle menu'
					>
						{isMobileMenuOpen ? (
							<X size={24} className='text-gray-700' />
						) : (
							<Menu size={24} className='text-gray-700' />
						)}
					</button>

					{/* Logo */}
					<div className='flex-shrink-0'>
						<TashaLogo />
					</div>
				</div>

				{/* Logo (Desktop only) */}
				<div className='hidden flex-shrink-0 lg:block'>
					<TashaLogo />
				</div>

				{/* Center: Toggle Buttons (Desktop only) */}
				<div className='absolute left-1/2 hidden -translate-x-1/2 space-x-4 lg:flex'>
					<Button
						variant={activeView === 0 ? 'teal' : 'null'}
						className={
							activeView === 0 ? 'border-b-2 border-[#0C5E6A]' : 'border-b-2 border-transparent'
						}
						onClick={() => setActiveView(0)}
					>
						Overview
					</Button>

					<Button
						variant={activeView === 1 ? 'teal' : 'null'}
						className={
							activeView === 1 ? 'border-b-2 border-[#0C5E6A]' : 'border-b-2 border-transparent'
						}
						onClick={() => setActiveView(1)}
					>
						Patients
					</Button>
				</div>

				{/* Right: User Info */}
				<div className='ml-auto flex flex-col items-end text-right'>
					<span className='text-gray-700 font-medium'>{displayName}</span>
					<span className='text-gray-500 text-sm'>{displayRole}</span>
				</div>
			</header>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div
					className='bg-black fixed inset-0 z-40 bg-opacity-50 lg:hidden'
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile Menu Drawer */}
			<div
				className={`
				fixed left-0 top-0 z-50 h-screen w-64 transform bg-white-primary
				shadow-xl transition-transform duration-300 ease-in-out
				${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
				lg:hidden
			`}
			>
				{/* Header */}
				<div className='border-gray-200 flex items-center justify-between border-b p-4'>
					<span className='text-lg font-bold'>Menu</span>
					<button
						onClick={() => setIsMobileMenuOpen(false)}
						className='text-gray-600 hover:text-gray-800 p-1'
						aria-label='Close menu'
					>
						<X size={20} />
					</button>
				</div>

				{/* Menu Options */}
				<div className='p-4'>
					<nav className='space-y-2'>
						<button
							onClick={() => handleViewChange(0)}
							className={`w-full rounded-lg p-3 text-left transition-colors ${
								activeView === 0
									? 'bg-teal-50 text-teal-700 border-teal-600 border-l-4 font-medium'
									: 'text-gray-700 hover:bg-gray-50'
							}`}
						>
							Overview
						</button>

						<button
							onClick={() => handleViewChange(1)}
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
