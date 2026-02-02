import { type FC, useState } from 'react';
import { Button } from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import { Controller } from 'react-hook-form';
import Dropdown from '../../../shared/components/Dropdown';
import usePatientForm from '../hooks/usePatientForm';
import { QueryParams } from '../../../routes/_protected/patients';
import { cn } from '../../../shared/utils/helpers';
import { useBlocker } from '@tanstack/react-router';
import {
	DROPDOWN_OPTIONS_GENDER,
	DROPDOWN_OPTIONS_MEDICATIONS,
	DROPDOWN_OPTIONS_PREVIOUSAMPUTATION,
	DROPDOWN_OPTIONS_STATUS,
	DROPDOWN_OPTIONS_TYPEOFDIABETES,
} from '../../../shared/utils/constants';
import { EditingPatient } from '../../../types/PatientTypes';
import TabButton from './TabButton';

type Props = {
	patient?: EditingPatient;
	mode: QueryParams['mode'];
	token: string;
	handleShowModal: () => void;
};

const PatientForm: FC<Props> = ({ handleShowModal, mode, patient, token }) => {
	const {
		control,
		register,
		errors,
		handleSubmit,
		isSubmitting,
		buttonDisabled,
		tabErrors,
		tab,
		setTab
	} = usePatientForm(mode, token, handleShowModal, patient);

	const [isCancelled, setIsCancelled] = useState<boolean>(false);

	useBlocker(
		() => window.confirm('Are you sure you want to close the modal? Your progress will be lost.'),
		isCancelled
	);

	//console.log("tabErrors", tabErrors);
	return (
		<form
			className='flex max-h-[calc(100vh-40px)] flex-col gap-y-5 p-3.5 sm:p-5'
			onSubmit={handleSubmit}
		>
			<div className='space-y-2.5'>
				<div className='text-2xl font-bold'>{mode} Patient</div>
				<div className='flex gap-2 max-sm:flex-col'>
					<TabButton
						currentTab={tab}
						error={tabErrors.Personal}
						setTab={setTab}
						tabName='Personal'
					/>
					<TabButton currentTab={tab} error={tabErrors.Contact} setTab={setTab} tabName='Contact' />
					<TabButton
						currentTab={tab}
						error={tabErrors.Diabetes}
						setTab={setTab}
						tabName='Diabetes'
					/>
				</div>
			</div>
			<div className={cn('hidden overflow-y-auto pr-2', { block: tab === 'Personal' })}>
				<Input
					autoComplete='off'
					label='First Name *'
					error={errors.firstName?.message}
					{...register('firstName')}
				/>
				<Input
					autoComplete='off'
					label='Last Name *'
					error={errors.lastName?.message}
					{...register('lastName')}
				/>
				<Controller
					control={control}
					name='gender'
					render={({ field }) => (
						<Dropdown
							label='Gender *'
							placeholderLabel='Choose Gender'
							value={field.value}
							updateValue={field.onChange}
							error={errors.gender?.message}
							options={DROPDOWN_OPTIONS_GENDER}
						/>
					)}
				/>
				<Input
					autoComplete='off'
					label='Height *'
					unit='cm'
					className='pr-11'
					error={errors.height?.message}
					{...register('height')}
				/>
				<Input
					autoComplete='off'
					label='Weight *'
					unit='kg'
					className='pr-11'
					error={errors.weight?.message}
					{...register('weight')}
				/>
				<Input
					autoComplete='off'
					label='Birth date *'
					type='date'
					error={errors.birthDate?.message}
					{...register('birthDate')}
				/>
				<Controller
					control={control}
					name='status'
					render={({ field }) => (
						<Dropdown
							label='Status *'
							placeholderLabel='Choose Status'
							value={field.value}
							updateValue={field.onChange}
							error={errors.status?.message}
							options={DROPDOWN_OPTIONS_STATUS}
						/>
					)}
				/>
				<Input
					autoComplete='off'
					label='Treatment Start Date *'
					type='date'
					error={errors.treatmentStartDate?.message}
					{...register('treatmentStartDate')}
				/>
				<Input
					autoComplete='off'
					label='Next Visit Date *'
					type='date'
					error={errors.nextVisitDate?.message}
					{...register('nextVisitDate')}
				/>
				<Input
					autoComplete='off'
					label='Last Visit Date *'
					type='date'
					error={errors.lastVisitDate?.message}
					{...register('lastVisitDate')}
				/>
			</div>
			<div className={cn('hidden overflow-y-auto pr-2', { block: tab === 'Contact' })}>
				<Input
					autoComplete='off'
					label='Phone Number *'
					unit='+44'
					unitSide='left'
					className='pl-11'
					error={errors.phoneNumber?.message}
					{...register('phoneNumber')}
				/>
				<Input
					autoComplete='off'
					label='Email *'
					error={errors.email?.message}
					{...register('email')}
				/>
				<Input
					autoComplete='off'
					label='Line 1 *'
					error={errors.address?.line1?.message}
					{...register('address.line1')}
				/>
				<Input
					autoComplete='off'
					label='Line 2'
					error={errors.address?.line2?.message}
					{...register('address.line2')}
				/>
				<Input
					autoComplete='off'
					label='Line 3'
					error={errors.address?.line3?.message}
					{...register('address.line3')}
				/>
				<Input
					autoComplete='off'
					label='County'
					error={errors.address?.county?.message}
					{...register('address.county')}
				/>
				<Input
					autoComplete='off'
					label='City *'
					error={errors.address?.city?.message}
					{...register('address.city')}
				/>
				<Input
					autoComplete='off'
					label='Postcode *'
					error={errors.address?.postcode?.message}
					{...register('address.postcode')}
				/>
				<Input
					autoComplete='off'
					label='Country *'
					error={errors.address?.country?.message}
					{...register('address.country')}
				/>
			</div>
			<div className={cn('hidden overflow-y-auto pr-2', { block: tab === 'Diabetes' })}>
				<Controller
					control={control}
					name='diabetesDetails.typeOfDiabetes'
					render={({ field }) => (
						<Dropdown
							label='Type of Diabetes'
							placeholderLabel='Choose Type of Diabetes'
							value={field.value}
							updateValue={field.onChange}
							error={errors.diabetesDetails?.typeOfDiabetes?.message}
							options={DROPDOWN_OPTIONS_TYPEOFDIABETES}
						/>
					)}
				/>
				<Controller
					control={control}
					name='diabetesDetails.previousAmputation'
					render={({ field }) => (
						<Dropdown
							label='Previous Amputation'
							placeholderLabel='Previous Amptuation?'
							value={field.value}
							updateValue={field.onChange}
							error={errors.diabetesDetails?.previousAmputation?.message}
							options={DROPDOWN_OPTIONS_PREVIOUSAMPUTATION}
						/>
					)}
				/>
				<Input
					autoComplete='off'
					label='Years Diagnosed With Diabetes'
					error={errors.diabetesDetails?.yearsDiagnosedWithDiabetes?.message}
					{...register('diabetesDetails.yearsDiagnosedWithDiabetes')}
				/>
				<Input
					autoComplete='off'
					label='Previous Foot Treatment Or Dysfunction'
					error={errors.diabetesDetails?.previousFootTreatmentOrDysfunction?.message}
					{...register('diabetesDetails.previousFootTreatmentOrDysfunction')}
				/>
				<Input
					autoComplete='off'
					label='Other Diabetic Associated Complications'
					error={errors.diabetesDetails?.otherDiabeticAssociatedComplications?.message}
					{...register('diabetesDetails.otherDiabeticAssociatedComplications')}
				/>
				<Input
					autoComplete='off'
					label='Last HbA1c Reading'
					unit='mmol/mol'
					className='pr-24'
					error={errors.diabetesDetails?.lastHbA1cReading?.message}
					{...register('diabetesDetails.lastHbA1cReading')}
				/>
				<Input
					autoComplete='off'
					label='Last HbA1c Date'
					type='date'
					error={errors.diabetesDetails?.lastHbA1cDate?.message}
					{...register('diabetesDetails.lastHbA1cDate')}
				/>
				<Input
					autoComplete='off'
					label='Last Lipid Profile'
					unit='mg/dL'
					className='pr-[72px]'
					error={errors.diabetesDetails?.lastLipidProfile?.message}
					{...register('diabetesDetails.lastLipidProfile')}
				/>
				<Input
					autoComplete='off'
					label='Last Lipid Profile Date'
					type='date'
					error={errors.diabetesDetails?.lastLipidProfileDate?.message}
					{...register('diabetesDetails.lastLipidProfileDate')}
				/>
				<Input
					autoComplete='off'
					label='Latest Blood Pressure'
					unit='mmHg'
					className='pr-[72px]'
					error={errors.diabetesDetails?.latestBp?.message}
					{...register('diabetesDetails.latestBp')}
				/>
				<Input
					autoComplete='off'
					label='Latest Blood Pressure Date'
					type='date'
					error={errors.diabetesDetails?.latestBpDate?.message}
					{...register('diabetesDetails.latestBpDate')}
				/>
				<Controller
					control={control}
					name='diabetesDetails.medications'
					render={({ field }) => (
						<Dropdown
							label='Medications'
							placeholderLabel='Medications?'
							value={field.value}
							updateValue={field.onChange}
							error={errors.diabetesDetails?.medications?.message}
							options={DROPDOWN_OPTIONS_MEDICATIONS}
						/>
					)}
				/>
				<Input
					autoComplete='off'
					label='Medications Info'
					error={errors.diabetesDetails?.medicationsInfo?.message}
					{...register('diabetesDetails.medicationsInfo')}
				/>
				<Input
					autoComplete='off'
					label='Other DM or CV Complications'
					error={errors.diabetesDetails?.otherDMorCVComplications?.message}
					{...register('diabetesDetails.otherDMorCVComplications')}
				/>
			</div>
			<div className='flex gap-x-8'>
				<Button
					type='button'
					onClick={() => {setIsCancelled(true); setTimeout(handleShowModal, 100)}}
					variant='slate'
					size='modal'
					className='w-full'
				>
					Cancel
				</Button>
				<Button
					type='submit'
					size='modal'
					className='w-full'
					disabled={buttonDisabled}
					isSubmitting={isSubmitting}
				>
					Save
				</Button>
			</div>
		</form>
	);
};

export default PatientForm;
