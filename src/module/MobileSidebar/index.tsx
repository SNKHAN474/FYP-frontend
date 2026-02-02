import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../Sidebar';

const MobileSidebar = () => {
	const [isOpen, setIsOpen] = useState(false);

	const handleOpen = () => setIsOpen(prev => !prev);

	if (!isOpen)
		return (
			<button type='button' onClick={handleOpen} className='block md:hidden'>
				<Menu size={20} />
			</button>
		);

	return (
		<div className='z-[100]'>
			<div className='fixed inset-0 block bg-black-primary bg-opacity-25 md:hidden' />
			<Sidebar mobile handleClose={() => setIsOpen(false)} />
		</div>
	);
};

export default MobileSidebar;
