// types/patient.ts

export interface PatientTableRow {
	patientId: string;
	name: string;
	age: number;
	treatmentStartDate: string;
	lastVisitDate: string;
	nextVisitDate: string;
	ulcerGrade: string;
	status: string;
}
