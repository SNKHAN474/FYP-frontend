import { FC } from 'react';
import { Patient } from '../../types/PatientTypes';
import Accordion from '../../shared/components/Accordion';
import { formatDate } from '../../shared/utils/helpers';

type Props = {
	patient: Patient;
};

const InfoColumn = ({ header, value }: { header: string; value: string }) => (
	<div className='flex w-fit flex-col gap-2'>
		<div className='text-xs text-slate-secondary'>{header}</div>
		<div className='text-sm font-bold'>{value}</div>
	</div>
);

const PersonalDetails: FC<Props> = ({ patient }) => {
	const { lastName, firstName, birthDate, address, phoneNumber, email } = patient;
	const phoneNumberWithCountryCode =
		phoneNumber || phoneNumber === 0 ? `+44 ${phoneNumber}` : '---';

	return (
		<Accordion title='PERSONAL DETAILS' animationDuration={0.15}>
			<div className='flex w-full flex-wrap gap-8'>
				<InfoColumn header='LAST NAME' value={lastName} />
				<InfoColumn header='FIRST NAME' value={firstName} />
				<InfoColumn header='BIRTHDATE' value={formatDate(birthDate).substring(0,10)} />
				<InfoColumn
					header='ADDRESS'
					value={`${address.line1 || '---'}, ${address.city || '---'}, ${address.country || '---'}`}
				/>
				<InfoColumn header='PHONE NUMBER' value={phoneNumberWithCountryCode} />
				<InfoColumn header='EMAIL' value={email || '---'} />
			</div>
		</Accordion>
	);
};

export default PersonalDetails;
