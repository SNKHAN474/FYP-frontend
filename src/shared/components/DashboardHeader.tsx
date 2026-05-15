import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import TashaLogo from '../components/NewTashaLogo';
import { Button } from '../components/Button';
import { Menu, X, LogOut } from 'lucide-react';

type DashboardHeaderProps = {
	activeView: number;
	setActiveView: (index: number) => void;
};

const DashboardHeader = ({ activeView, setActiveView }: DashboardHeaderProps) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	// Set initial state to avoid "Loading..." if data is found immediately[cite: 3]
	const [userData, setUserData] = useState<{ name: string; position: string }>({
		name: 'Clinician',
		position: 'Medical Staff',
	});
	const navigate = useNavigate();

	useEffect(() => {
		const savedName = localStorage.getItem('userName');
		const savedPosition = localStorage.getItem('userPosition');

		if (savedName && savedPosition) {
			setUserData({ name: savedName, position: savedPosition });
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('userName');
		localStorage.removeItem('userPosition');
		localStorage.removeItem('clinicianId');
		navigate({ to: '/login' });
	};

	const handleNavigation = (index: number) => {
		navigate({ to: '/TEMP_table_test' });
		setActiveView(index);
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			<header className='relative z-30 flex items-center bg-white-primary px-4 py-4 shadow-sm sm:px-8 md:px-12 lg:px-20 xl:px-40'>
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

				<div className='hidden flex-shrink-0 lg:block'>
					<TashaLogo />
				</div>

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

				<div className='ml-auto flex items-center gap-6'>
					<div className='flex flex-col items-end text-right'>
						<span className='text-gray-700 font-medium'>{userData.name}</span>
						<span className='text-gray-500 text-sm capitalize'>{userData.position}</span>
					</div>

					<button
						onClick={handleLogout}
						className='text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-medium transition-colors'
					>
						<LogOut size={18} />
						<span className='hidden md:inline'>Logout</span>
					</button>
				</div>
			</header>
		</>
	);
};

export default DashboardHeader;
