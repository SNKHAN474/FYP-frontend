import { useMemo } from 'react';

type Patient = {
	name: string;
	age: number;
	id: string;
	startDate: string;
	lastVisit: string;
	nextVisit: string;
	ulcerGrade: string;
	status: 'New' | 'Active' | 'In-Active' | 'Warning';
	flag?: boolean;
};

type SortOption = 'nextVisit' | 'lastVisit' | 'startDate' | 'name' | 'age';

export const usePatientsFilter = (
	patients: Patient[],
	searchTerm: string,
	statusFilter: string,
	ulcerGradeFilter: string,
	sortBy: SortOption,
) => {
	const filteredAndSortedPatients = useMemo(() => {
		let filtered = [...patients];

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(
				patient =>
					patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					patient.id.includes(searchTerm),
			);
		}

		// Apply status filter
		if (statusFilter) {
			filtered = filtered.filter(patient => patient.status === statusFilter);
		}

		// Apply ulcer grade filter - check for number in the grade string
		if (ulcerGradeFilter) {
			const gradeNumber = ulcerGradeFilter.trim();
			filtered = filtered.filter(patient => {
				const patientGrades = patient.ulcerGrade.split('|').map(g => g.trim());
				// Check if the grade number appears anywhere in the ulcer grade
				return patientGrades.some(grade => grade === gradeNumber);
			});
		}

		// Apply sorting
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'age':
					return a.age - b.age;
				case 'nextVisit':
					return (
						new Date(a.nextVisit.split('/').reverse().join('-')).getTime() -
						new Date(b.nextVisit.split('/').reverse().join('-')).getTime()
					);
				case 'lastVisit':
					return (
						new Date(a.lastVisit.split('/').reverse().join('-')).getTime() -
						new Date(b.lastVisit.split('/').reverse().join('-')).getTime()
					);
				case 'startDate':
					return (
						new Date(a.startDate.split('/').reverse().join('-')).getTime() -
						new Date(b.startDate.split('/').reverse().join('-')).getTime()
					);
				default:
					return 0;
			}
		});

		return filtered;
	}, [patients, searchTerm, statusFilter, ulcerGradeFilter, sortBy]);

	return filteredAndSortedPatients;
};
