import { FC } from 'react';
import InfoRow from '../../shared/components/InfoRow';
import { Patient } from '../../types/PatientTypes';
import { formatDate } from '../../shared/utils/helpers';

const checkIfNumberUndefined = (value?: number | null) => (value || value === 0 ? value : '---');

const DiabetesInfoBox: FC<Patient['diabetesDetails']> = diabetesDetails => {
	const {
		typeOfDiabetes,
		previousAmputation,
		yearsDiagnosedWithDiabetes,
		previousFootTreatmentOrDysfunction,
		otherDiabeticAssociatedComplications,
		lastHbA1cReading,
		lastHbA1cDate,
		lastLipidProfile,
		lastLipidProfileDate,
		latestBp,
		latestBpDate,
		medications,
		otherDMorCVComplications,
	} = diabetesDetails;

	return (
		<div className='flex flex-col justify-evenly gap-y-3 rounded-lg border border-slate-border bg-white-primary p-3'>
			<div className='text-lg font-bold text-slate-secondary'>Diabetes specific</div>
			<div className='space-y-2'>
				<InfoRow
					header='Type of diabetes'
					value={
						typeOfDiabetes === undefined ? '---' : typeOfDiabetes === 'TYPE_1' ? 'Type 1' : 'Type 2'
					}
				/>
				<InfoRow
					header='Previous amputation'
					value={previousAmputation === undefined ? '---' : previousAmputation ? 'Yes' : 'No'}
				/>
				<InfoRow
					header='Years diagnosed with diabetes'
					value={checkIfNumberUndefined(yearsDiagnosedWithDiabetes)}
				/>
				<InfoRow
					header='Previous foot treatment or dysfunction'
					value={previousFootTreatmentOrDysfunction || '---'}
				/>
				<InfoRow
					header='Other diabetic associated complication'
					value={otherDiabeticAssociatedComplications || '---'}
				/>
				<InfoRow
					header='Last HbA1c reading'
					value={checkIfNumberUndefined(lastHbA1cReading) + ' mmol/mol'}
					tooltip={lastHbA1cDate ? formatDate(lastHbA1cDate) : '---'}
				/>
				<InfoRow
					header='Last lipid profile'
					value={checkIfNumberUndefined(lastLipidProfile) + ' mg/dL'}
					tooltip={lastLipidProfileDate ? formatDate(lastLipidProfileDate) : '---'}
				/>
				<InfoRow
					header='Latest BP'
					value={checkIfNumberUndefined(latestBp) + ' mmHg'}
					tooltip={latestBpDate ? formatDate(latestBpDate) : '---'}
				/>
				<InfoRow
					header='Medications'
					value={medications === undefined ? '---' : medications ? 'Yes' : 'No'}
				/>
				<InfoRow header='Other DM or CV complications' value={otherDMorCVComplications || '---'} />
			</div>
		</div>
	);
};

export default DiabetesInfoBox;
