import { type FC } from 'react';
import { flexRender, type HeaderGroup } from '@tanstack/react-table';
import type { PatientWithoutScansAndNotes } from '../../../types/PatientTypes';
import { cn } from '../../../shared/utils/helpers';

type Props = { headerGroup: HeaderGroup<PatientWithoutScansAndNotes>; lastColumnIndex: number };

const HeaderRow: FC<Props> = ({ headerGroup, lastColumnIndex }) => (
	<tr className='text-nowrap'>
		{headerGroup.headers.map(header => (
			<th
				key={header.id}
				className={cn('bg-[#F5F5F5] p-2', {
					'rounded-l-xl pl-4': header.index === 0,
					'rounded-r-xl pr-4': header.index === lastColumnIndex,
				})}
				style={{ width: header.getSize() }}
			>
				{flexRender(header.column.columnDef.header, header.getContext())}
			</th>
		))}
	</tr>
);

export default HeaderRow;
