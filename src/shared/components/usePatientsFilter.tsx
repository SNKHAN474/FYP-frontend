import { useMemo } from 'react';

// Adjusted type to match your MongoDB Schema
type Patient = {
	PatientId: string;
	Name: string;
	'Personal Details': {
		Status: string;
		NextVisitDate: string;
		LastVisitDate: string;
		TreatmentStartDate: string;
		DateOfBirth: string;
	};
	Ulcers: Array<{
		UlcerGrade: string;
	}>;
};

type SortOption = 'nextVisit' | 'lastVisit' | 'startDate' | 'name';

export const usePatientsFilter = (
	patients: Patient[],
	searchTerm: string,
	statusFilter: string,
	ulcerGradeFilter: string,
	sortBy: SortOption,
) => {
	const filteredAndSortedPatients = useMemo(() => {
		let filtered = [...(patients || [])];

		// 1. Search Filter (Name or ID)
		if (searchTerm) {
			const lowSearch = searchTerm.toLowerCase();
			filtered = filtered.filter(
				p =>
					p['Personal Details']?.Name?.toLowerCase().includes(lowSearch) ||
					p.PatientId?.toLowerCase().includes(lowSearch),
			);
		}

		// 2. Status Filter (Nested in Personal Details)
		if (statusFilter) {
			filtered = filtered.filter(p => p['Personal Details']?.Status === statusFilter);
		}

		// 3. Ulcer Grade Filter (Check array of Ulcers)
		if (ulcerGradeFilter) {
			filtered = filtered.filter(p => p.Ulcers?.some(u => u.UlcerGrade === ulcerGradeFilter));
		}

		// 4. Sorting Logic
		filtered.sort((a, b) => {
			const detailsA = a['Personal Details'];
			const detailsB = b['Personal Details'];

			switch (sortBy) {
				case 'name':
					return a.Name.localeCompare(b.Name);
				case 'nextVisit':
					return (
						new Date(detailsA?.NextVisitDate).getTime() -
						new Date(detailsB?.NextVisitDate).getTime()
					);
				case 'lastVisit':
					return (
						new Date(detailsB?.LastVisitDate).getTime() -
						new Date(detailsA?.LastVisitDate).getTime()
					);
				case 'startDate':
					return (
						new Date(detailsA?.TreatmentStartDate).getTime() -
						new Date(detailsB?.TreatmentStartDate).getTime()
					);
				default:
					return 0;
			}
		});

		return filtered;
	}, [patients, searchTerm, statusFilter, ulcerGradeFilter, sortBy]);

	return filteredAndSortedPatients;
};
