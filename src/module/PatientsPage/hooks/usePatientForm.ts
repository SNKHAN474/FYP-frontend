import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	type TPatientSchema,
	PatientFormValues,
	PatientSchema,
} from '../../../shared/form/schemas';
import { requiredFieldsAreEmpty } from '../../../shared/utils/helpers';
import { useRouter } from '@tanstack/react-router';
import { QueryParams } from '../../../routes/_protected/patients';
import { createPatient, updatePatient } from '../../../shared/api/services/patientService';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '../../../shared/utils/constants';
import { EditingPatient } from '../../../types/PatientTypes';

export type Tab = 'Personal' | 'Contact' | 'Diabetes';

const FIELDS: Record<Tab, Field[]> = {
	Personal: [
		'firstName',
		'lastName',
		'gender',
		'height',
		'weight',
		'birthDate',
		'status',
		'treatmentStartDate',
		'nextVisitDate',
		'lastVisitDate',
	],
	Contact: [
		'phoneNumber',
		'email',
		['address', 'line1'],
		['address', 'line2'],
		['address', 'line3'],
		['address', 'county'],
		['address', 'city'],
		['address', 'postcode'],
		['address', 'country'],
	],
	Diabetes: [
		['diabetesDetails', 'typeOfDiabetes'],
		['diabetesDetails', 'previousAmputation'],
		['diabetesDetails', 'yearsDiagnosedWithDiabetes'],
		['diabetesDetails', 'previousFootTreatmentOrDysfunction'],
		['diabetesDetails', 'otherDiabeticAssociatedComplications'],
		['diabetesDetails', 'lastHbA1cReading'],
		['diabetesDetails', 'lastHbA1cDate'],
		['diabetesDetails', 'lastLipidProfile'],
		['diabetesDetails', 'lastLipidProfileDate'],
		['diabetesDetails', 'latestBp'],
		['diabetesDetails', 'latestBpDate'],
		['diabetesDetails', 'medications'],
		['diabetesDetails', 'medicationsInfo'],
		['diabetesDetails', 'otherDMorCVComplications'],
	],
};

type Field =
	| keyof PatientFormValues
	| [keyof PatientFormValues, PatientFormValues[keyof PatientFormValues]];

type MessageObject = { message?: string };
type SubFieldObject = Record<keyof PatientFormValues, MessageObject>;

type ErrorField = MessageObject | SubFieldObject;

const errorIsMessageObject = (error: ErrorField): error is MessageObject => 'message' in error;

const hasError = (
	tab: Tab,
	errors: Partial<Record<keyof PatientFormValues, ErrorField>>,
): boolean => {
	const fields = FIELDS[tab];
	return fields.some(field => {
		const errorKey = Array.isArray(field) ? field[0] : field;
		const errorField = errors[errorKey];

		if (!errorField) return false;

		if (errorIsMessageObject(errorField)) {
			return !!errorField.message;
		} else {
			return Object.values(errorField).some(subFieldError => !!subFieldError?.message);
		}
	});
};

const usePatientForm = (
	mode: QueryParams['mode'],
	token: string,
	handleShowModal: () => void,
	defaultValues?: EditingPatient,
) => {
	const router = useRouter();
	const [tab, setTab] = useState<'Personal' | 'Contact' | 'Diabetes'>('Personal');
	const {
		register,
		handleSubmit: handleValidation,
		formState: { errors },
		setFocus,
		control,
		watch,
	} = useForm<PatientFormValues, unknown, TPatientSchema>({
		resolver: zodResolver(PatientSchema),
		reValidateMode: 'onChange',
		mode: 'onChange',
		defaultValues,
	});

	const tabErrors = {
		Personal: hasError('Personal', errors),
		Contact: hasError('Contact', errors),
		Diabetes: hasError('Diabetes', errors),
	};

	const { mutate, isPending } = useMutation({
		mutationFn: async (patient: TPatientSchema) => {
			try {
				if (mode === 'Edit') {
					if (!defaultValues?.id) {
						toast.error('Missing ID on patient', { duration: 3500 });
						return;
					}
					await updatePatient(token, { id: defaultValues.id, ...patient });
					toast.success('Patient saved successfully', { duration: 3500 });
				} else if (mode === 'Add') {
					await createPatient(token, patient);
					toast.success('Patient created successfully', { duration: 3500 });
				}
				router.invalidate();
				handleShowModal();
			} catch (error) {
				toast.error(ERROR_MESSAGES.GENERIC, { duration: 3500 });
			}
		},
	});

	useEffect(() => {
		setFocus('firstName');
	}, [setFocus]);

	const buttonDisabled =
		requiredFieldsAreEmpty<PatientFormValues>(watch, [
			'firstName',
			'lastName',
			'gender',
			'height',
			'weight',
			'birthDate',
			'status',
			'treatmentStartDate',
			'nextVisitDate',
			'lastVisitDate',
			'phoneNumber',
			'email',
			'address.line1',
			'address.city',
			'address.postcode',
			'address.country'
		]);

	return {
		register,
		control,
		errors,
		handleSubmit: handleValidation(user => mutate(user)),
		isSubmitting: isPending,
		buttonDisabled,
		tabErrors,
		tab,
		setTab
	};
};

export default usePatientForm;
