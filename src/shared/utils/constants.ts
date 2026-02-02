import { MessageSquare, Users } from 'lucide-react';
import { NavLink } from '../../types/NavigationTypes';

export const ERROR_MESSAGES = {
	AUTH: {
		EMAIL: {
			MAX_LENGTH: 'Email address must be less than 50 characters',
			INVALID: 'Invalid email address',
			UNIQUE: 'An account with this email address already exists',
			EXISTS: 'An account with this email address does not exist',
		},
		PASSWORD: {
			MIN_LENGTH: 'Password must be at least 8 characters',
			MAX_LENGTH: 'Password must be less than 50 characters',
			MATCH: 'Passwords must match',
			SPECIAL: 'Password must contain at least 1 special character',
		},
		INVALID_CREDENTIALS: 'Invalid email address or password',
	},
	PATIENT: {
		MAX_EMAIL_LENGTH: 'Email address must be less than 50 characters',
	},
	COMMON_ERRORS: {
		INVALID_NUMBER: 'Invalid number',
		REQUIRED_FIELD: 'Required field',
	},
	GENERIC: 'An unexpected error has occured',
};

export const NAV_LINKS: NavLink[] = [
	{ label: 'Patients', to: '/patients', icon: Users },
	{ label: 'Messages', to: '/messages', icon: MessageSquare },
];

export const DROPDOWN_OPTIONS_GENDER = [
	{ label: 'M', value: 'M' },
	{ label: 'F', value: 'F' },
	{ label: 'O', value: 'O' },
];

export const DROPDOWN_OPTIONS_STATUS = [
	{ label: 'New', value: 'NEW' },
	{ label: 'Inactive', value: 'INACTIVE' },
	{ label: 'Active', value: 'ACTIVE' },
	{ label: 'Missing scans', value: 'Missing scans' },
	{ label: 'Flagged', value: 'Flagged' },
];

export const DROPDOWN_OPTIONS_TYPEOFDIABETES = [
	{ label: 'TYPE 1', value: 'TYPE_1' },
	{ label: 'TYPE 2', value: 'TYPE_2' },
];

export const DROPDOWN_OPTIONS_PREVIOUSAMPUTATION = [
	{ label: 'Yes', value: 'true' },
	{ label: 'No', value: 'false' },
];

export const DROPDOWN_OPTIONS_MEDICATIONS = [
	{ label: 'Yes', value: 'true' },
	{ label: 'No', value: 'false' },
];
