import { type FC } from 'react';
import Accordion from '../../../shared/components/Accordion';
import type { Scan } from '../../../types/ScanTypes';
import ScanImage from './components/ScanImage';
import Image from '../../../../public/models/foot.jpg';
import { formatDate } from '../../../shared/utils/helpers';

type Props = {
	scans: Scan[];
	patientId: string;
};

const RecentScans: FC<Props> = ({ scans, patientId }) => {
	const lastScan = scans[scans.length - 1];
	return (
		<Accordion title={!lastScan ? 'RECENT SCAN' : `RECENT SCAN - ${formatDate(lastScan?.created)}`} animationDuration={0.3}>
			<div className='flex gap-3 max-lg:flex-col'>
				<div className='space-y-2'>
					<div className='max-w-[709px] lg:w-64 xl:w-[450px] 2xl:w-[664px]'>
						<ScanImage scan={lastScan} />
					</div>
					<div className='flex max-w-[709px] gap-x-2 overflow-x-auto lg:w-64 xl:w-[450px] 2xl:w-[664px]'>
						{/* TODO: Call AWS services in the loader and map through images here */}
						{lastScan?.images.map((_, i) => (
							<img key={`image-${i}`} src={`https://mig-tasha-test.s3.eu-west-2.amazonaws.com/${patientId}/${patientId}.jpg`} className='h-20 rounded-md' />
						))}
					</div>
				</div>
				<div className='flex-1 space-y-3'>
					<div className='text-sm text-slate-secondary'>Patient's comments</div>
					<div className='text-xs'>{lastScan?.patientComments}</div>
				</div>
			</div>
		</Accordion>
	);
};

export default RecentScans;
