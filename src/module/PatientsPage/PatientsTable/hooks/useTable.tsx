import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
	type ColumnDef,
	PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { PatientWithoutScansAndNotes } from '../../../../types/PatientTypes';

const getPageOptions = (currentPageIndex: number, numberOfPages: number): string[] => {
	const pageOptions = ['1'];
	const maxDisplayedPages = 6;

	const currentIndexIsNearStart = currentPageIndex < maxDisplayedPages - 2;
	const currentIndexIsNearEnd = currentPageIndex > numberOfPages - (maxDisplayedPages - 1);

	if (numberOfPages <= maxDisplayedPages) {
		for (let i = 2; i <= numberOfPages; i++) {
			pageOptions.push(i.toString());
		}
	} else {
		if (currentIndexIsNearStart) {
			const lastVisiblePageNumber = maxDisplayedPages - 1;
			for (let i = 2; i < lastVisiblePageNumber; i++) {
				pageOptions.push(i.toString());
			}
			pageOptions.push(lastVisiblePageNumber.toString() + '...');
			pageOptions.push(numberOfPages.toString());
		} else if (currentIndexIsNearEnd) {
			const firstVisiblePageNumber = numberOfPages - 4;
			pageOptions.push('...' + firstVisiblePageNumber.toString());
			for (let i = firstVisiblePageNumber + 1; i < numberOfPages + 1; i++) {
				pageOptions.push(i.toString());
			}
		} else {
			pageOptions.push('...' + (currentPageIndex - 1).toString());
			for (let i = currentPageIndex; i <= currentPageIndex + 1; i++) {
				pageOptions.push(i.toString());
			}
			pageOptions.push((currentPageIndex + 2).toString() + '...');
			pageOptions.push(numberOfPages.toString());
		}
	}

	return pageOptions;
};

const useTable = (
	patients: PatientWithoutScansAndNotes[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<PatientWithoutScansAndNotes, any>[],
) => {
	const navigate = useNavigate();

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 7,
	});

	const totalNumberOfPatients = patients.length;
	const startingPatientNumber = pagination.pageIndex * pagination.pageSize + 1;
	const endingPatientNumber = Math.min(
		pagination.pageIndex * pagination.pageSize + pagination.pageSize,
		totalNumberOfPatients,
	);

	const numberOfPages = Math.ceil(totalNumberOfPatients / pagination.pageSize);

	const defaultPageOptions = getPageOptions(pagination.pageIndex, numberOfPages);
	const [pageOptions, setPageOptions] = useState(defaultPageOptions);

	useEffect(() => {
		const newPageOptions = getPageOptions(pagination.pageIndex, numberOfPages);
		setPageOptions(newPageOptions);
	}, [pagination]);

	const table = useReactTable({
		columns,
		data: patients,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});

	return {
		navigate,
		table,
		pageOptions,
		totalNumberOfPatients,
		startingPatientNumber,
		endingPatientNumber,
		numberOfPages,
		currentPageIndex: pagination.pageIndex,
	};
};

export default useTable;
