import { FC } from 'react';
import { Scan } from '../../../types/ScanTypes';
import { formatDate } from '../../../shared/utils/helpers';
import InfoRow from '../../../shared/components/InfoRow';

type Props = {
	scan: Scan | undefined;
};

const ScanInfoBox: FC<Props> = ({ scan }) => {
	const lastAnnotationDetails = scan?.annotations[scan.annotations.length - 1];
	if(!!lastAnnotationDetails)
	{
		const { area, averageDepth, created } = lastAnnotationDetails;
		const date = formatDate(created);
		return (
			<div className='flex h-full w-full flex-col justify-evenly gap-y-2 rounded-lg border border-slate-border bg-white-primary p-4 xl:min-w-64'>
				<InfoRow header={'Area'} value={area.amount + ' ' + 'mm'} />
				<InfoRow header={'Ave. Depth'} value={averageDepth.amount + ' ' + 'mm'} />
				<InfoRow header={'Date'} value={date.substring(0, 10)} />
				<InfoRow header={'Glucose readings'} value={scan.glucoseLiveReadings} />
				<InfoRow header={'Patient comments'} value={scan.patientComments} />
			</div>
		);
	}
	else {
		return (
			<div className='flex h-full w-full flex-col justify-evenly gap-y-2 rounded-lg border border-slate-border bg-white-primary p-4 xl:min-w-64'>
				<InfoRow header={'Area'} value={''} />
				<InfoRow header={'Ave. Depth'} value={''} />
				<InfoRow header={'Date'} value={''} />
				<InfoRow header={'Glucose live readings'} value={scan?.glucoseLiveReadings} />
				<InfoRow header={'Patient comments'} value={scan?.patientComments} />
			</div>
		);
	}
};

export default ScanInfoBox;
