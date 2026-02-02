import { z } from 'zod';
import { ERROR_MESSAGES } from '../utils/constants';

const { PASSWORD } = ERROR_MESSAGES.AUTH;
const { INVALID_NUMBER, REQUIRED_FIELD } = ERROR_MESSAGES.COMMON_ERRORS;

const passwordRegex = /^(?=.*[!@#$%^&*])/;

export const LoginSchema = z.object({
	email: z.string().min(1),
	password: z.string().min(1),
});

export type TLoginSchema = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = LoginSchema.omit({ password: true });

export type TForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(1)
			.min(8, PASSWORD.MIN_LENGTH)
			.max(50, PASSWORD.MAX_LENGTH)
			.regex(passwordRegex, PASSWORD.SPECIAL),
		confirmPassword: z.string().min(1),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: PASSWORD.MATCH,
		path: ['password'],
	});

export type TResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;

const OptionalNumberSchema = z.number()
	.or(z.string())
	.nullable()
	.optional()
	.transform(value => (!value && value !== 0 ? undefined : Number(value)))
	.pipe(z.number({ invalid_type_error: INVALID_NUMBER }).optional());

const RequiredNumberSchema = z
	.number({ required_error: REQUIRED_FIELD })
	.or(z.string().min(1, REQUIRED_FIELD))
	.transform(value => Number(value))
	.pipe(z.number({ invalid_type_error: INVALID_NUMBER }));

const OptionalBooleanSchema = z
	.enum(['true', 'false'])
	.transform(value => (value === undefined ? undefined : value === 'true'))
	.optional();

const DateSchema = z.string().transform(date => (!!date ? new Date(date) : ''));

const RequiredDateSchema = z
	.string()
	.min(1, REQUIRED_FIELD)
	.transform(date => (!!date ? new Date(date) : ''));

export const PatientSchema = z.object({
	firstName: z.string().min(1, REQUIRED_FIELD),
	lastName: z.string().min(1, REQUIRED_FIELD),
	email: z.string().max(50, ERROR_MESSAGES.PATIENT.MAX_EMAIL_LENGTH),
	gender: z.enum(['M', 'F', 'Other']),
	height: RequiredNumberSchema,
	weight: RequiredNumberSchema,
	address: z.object({
		line1: z.string().min(1, REQUIRED_FIELD),
		line2: z.string(),
		line3: z.string(),
		county: z.string(),
		city: z.string().min(1, REQUIRED_FIELD),
		postcode: z.string().min(1, REQUIRED_FIELD),
		country: z.enum(["GB","US"]),
	}),
	phoneNumber: OptionalNumberSchema,
	birthDate: RequiredDateSchema,
	status: z.enum([
		'NEW',
		'ACTIVE',
		'INACTIVE',
		'Missing scans',
		'Flagged',
	]),
	treatmentStartDate: RequiredDateSchema,
	nextVisitDate: RequiredDateSchema,
	lastVisitDate: RequiredDateSchema,
	//clinicianNotes: z.string(),
	diabetesDetails: z.object({
		typeOfDiabetes: z.enum(['TYPE_1', 'TYPE_2']).nullable().optional(),
		previousAmputation: OptionalBooleanSchema,
		yearsDiagnosedWithDiabetes: OptionalNumberSchema,
		previousFootTreatmentOrDysfunction: z.string(),
		otherDiabeticAssociatedComplications: z.string(),
		lastHbA1cReading: OptionalNumberSchema,
		lastHbA1cDate: DateSchema,
		lastLipidProfile: OptionalNumberSchema,
		lastLipidProfileDate: DateSchema,
		latestBp: OptionalNumberSchema,
		latestBpDate: DateSchema,
		medications: OptionalBooleanSchema,
		medicationsInfo: z.string(),
		otherDMorCVComplications: z.string(),
	}).partial(),
});

export type PatientFormValues = z.input<typeof PatientSchema>;

export type TPatientSchema = z.output<typeof PatientSchema>;
