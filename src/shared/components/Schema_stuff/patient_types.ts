export interface PatientTableRow {
	id: string; // The MongoDB _id for navigation
	patientId: string; // The generated PAT-XXXX ID
	ClinicianId: string; // Required for table filtering[cite: 3, 4]
	name: string; // Will be formatted as "First Last"
	age: number;
	treatmentStartDate: string;
	lastVisitDate: string;
	nextVisitDate: string;
	ulcerGrade: string;
	status: string;
}
