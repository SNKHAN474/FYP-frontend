// utils/mapPatientsToTable.ts
import { PatientTableRow } from './patient_types';

export function calculateAge(dob: string): number {
	const [day, month, year] = dob.split('/').map(Number);
	const birthDate = new Date(year, month - 1, day);
	const diff = Date.now() - birthDate.getTime();
	return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function mapPatientsToTable(data: any[]): PatientTableRow[] {
	return data.map(patient => {
		const details = patient['Personal Details'];
		const ulcers = patient.Ulcers ?? [];

		// 🔑 UPDATE: Map all grades, sort them, and join with a pipe
		const combinedUlcerGrades =
			ulcers.length > 0
				? ulcers
						.map((u: any) => u.UlcerGrade)
						.filter(Boolean) // Remove empty/null values
						.sort((a: string, b: string) => Number(a) - Number(b)) // Optional: keeps them in order (1 | 2 | 3)
						.join(' | ')
				: '—';

		return {
			id: patient._id,
			patientId: patient.PatientId,
			name: details.Name,
			age: calculateAge(details.DateOfBirth),
			treatmentStartDate: details.TreatmentStartDate,
			lastVisitDate: details.LastVisitDate,
			nextVisitDate: details.NextVisitDate,
			ulcerGrade: combinedUlcerGrades, // Now returns "2 | 3 | 3"
			status: details.Status,
		};
	});
}
