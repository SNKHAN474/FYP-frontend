import { type LinkOptions } from '@tanstack/react-router';
import { type LucideIcon } from 'lucide-react';

export type NavLink = {
	label: string;
	to: LinkOptions['to'];
	icon: LucideIcon;
};
