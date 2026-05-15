import { PatientTableRow } from './patient_types';

export function calculateAge(dob: string): number {
	if (!dob) return 0;
	// Assumes DD/MM/YYYY or YYYY-MM-DD from the form
	const birthDate = new Date(dob);
	if (isNaN(birthDate.getTime())) return 0;
	const diff = Date.now() - birthDate.getTime();
	return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function mapPatientsToTable(data: any[]): PatientTableRow[] {
	return data.map(patient => {
		const details = patient['Personal Details'] || {};
		const ulcers = patient.Ulcers ?? [];

		// Combine Ulcer Grades into a single string[cite: 3]
		const combinedUlcerGrades =
			ulcers.length > 0
				? ulcers
						.map((u: any) => u.UlcerGrade)
						.filter(Boolean)
						.sort((a: string, b: string) => Number(a) - Number(b))
						.join(' | ')
				: '—';

		return {
			id: patient._id,
			patientId: patient.PatientId,
			ClinicianId: patient.ClinicianId || patient.clinicianId, // Support both casings[cite: 3, 4]
			// UPDATED NAME FORMAT: "{fname} {lname}"[cite: 3]
			name: `${details.FName || ''} ${details.Lname || ''}`.trim() || 'Unknown',
			age: details.DateOfBirth ? calculateAge(details.DateOfBirth) : 0,
			treatmentStartDate: details.TreatmentStartDate || '—',
			lastVisitDate: details.LastVisitDate || '—',
			nextVisitDate: details.NextVisitDate || '—',
			ulcerGrade: combinedUlcerGrades,
			status: details.Status || 'New',
		};
	});
}
