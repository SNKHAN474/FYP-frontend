import { PatientFormValues } from '../shared/form/schemas';
import { Scan } from './ScanTypes';

export type ClinicianNotes = {
	created: string;
	notes: string;
}

export type Patient = {
	id: string;
	sequenceNumber: number;
	firstName: string;
	lastName: string;
	email: string;
	gender: 'M' | 'F' | 'Other';
	height: number;
	weight: number;
	bmi: number;
	address: {
		line1: string;
		line2: string;
		line3: string;
		county: string;
		city: string;
		postcode: string;
		country: 'GB' | 'US';
	};
	phoneNumber?: number;
	birthDate: string | Date;
	status: 'NEW' | 'INACTIVE' | 'ACTIVE' | 'Missing scans' | 'Flagged';
	treatmentStartDate: string | Date;
	nextVisitDate: string | Date;
	lastVisitDate: string | Date;
	clinicianNotes?: Array<ClinicianNotes> | string;
	diabetesDetails: {
		typeOfDiabetes?: 'TYPE_1' | 'TYPE_2' | null;
		previousAmputation?: boolean;
		yearsDiagnosedWithDiabetes?: number;
		previousFootTreatmentOrDysfunction?: string;
		otherDiabeticAssociatedComplications?: string;
		lastHbA1cReading?: number;
		lastHbA1cDate?: string | Date;
		lastLipidProfile?: number;
		lastLipidProfileDate?: string | Date;
		latestBp?: number | null;
		latestBpDate?: string | Date;
		medications?: boolean;
		medicationsInfo?: string;
		otherDMorCVComplications?: string;
	};
	scans: Scan[];
};

export type PatientWithoutScansAndNotes = Omit<Patient, 'scans' | 'cliniciansNotes'>;

export type PatientWithoutScans = Omit<Patient, 'scans'>;

export type EditingPatient = PatientFormValues &
	Pick<PatientWithoutScans, 'id' | 'sequenceNumber' | 'bmi'>;
