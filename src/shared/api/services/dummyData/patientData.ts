//@ts-nocheck
import { Patient } from '../../../../types/PatientTypes';
import { Scan } from '../../../../types/ScanTypes';

const patient: Patient = {
	id: '1',
	sequenceNumber: 1,
	firstName: 'Michael',
	lastName: 'Davis',
	email: 'michael.davis@example.com',
	address: {
		line1: '123 High Street',
		line2: 'Apt 2B',
		line3: '',
		county: 'London',
		city: 'London',
		postcode: 'SW1A 1AA',
		country: 'United Kingdom',
	},
	birthDate: new Date('1990-05-15').toISOString(),
	lastSeenDate: new Date('2021-08-20').toISOString(),
	gender: 'Female',
	height: 165,
	weight: 60,
	bmi: 22,
	phoneNumber: 7123456789,
	status: 'New Patient',
	treatmentStartDate: new Date('2021-03-10').toISOString(),
	nextVisitDate: new Date('2021-09-10').toISOString(),
	diabetesDetails: {
		typeOfDiabetes: 'TYPE2',
		previousAmputation: false,
		yearsDiagnosedWithDiabetes: 5,
		previousFootTreatmentOrDysfunction: 'None',
		otherDiabeticAssociatedComplications: 'None',
		lastHbA1cReading: 7.2,
		lastHbA1cDate: new Date('2021-08-15').toISOString(),
		lastLipidProfile: 150,
		lastLipidProfileDate: new Date('2021-08-15').toISOString(),
		latestBp: 120,
		latestBpDate: new Date('2021-08-20').toISOString(),
		medications: true,
		medicationsInfo: 'Metformin',
		otherDMorCVComplications: 'None',
	},
	cliniciansNotes:
		'Despite interventions, struggles with medication adherence and lifestyle modifications persist, reflected in elevated HbA1c levels (8.5%). Continued support and counselling are essential to address barriers to self-management.',
	scans: [
		{
			created: new Date('2021-08-14').toISOString(),
			annotationDetails: [
				{
					area: { amount: 16, unit: 'mm' },
					averageDepth: { amount: 2, unit: 'mm' },
					created: new Date('2021-08-14').toISOString(),
				},
			],
			patientComments:
				"The pain has been persistent, and I'm concerned about any potential complications. ",
			glucoseLiveReadings: 16,
			images: [
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
			],
			rgb: { bucket: 'bucket', key: 'key' },
		} as Scan,
		{
			created: new Date('2021-08-15').toISOString(),
			annotationDetails: [
				{
					area: { amount: 16, unit: 'mm' },
					averageDepth: { amount: 2, unit: 'mm' },
					created: new Date('2021-08-15').toISOString(),
				},
			],
			patientComments:
				"The pain has been persistent, and I'm concerned about any potential complications. ",
			glucoseLiveReadings: 16,
			images: [
				{  bucket: 'bucket', key: 'key' },
				{  bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
			],
			rgb: { bucket: 'bucket', key: 'key' },
		} as Scan,
		{
			created: new Date('2021-08-16').toISOString(),
			annotationDetails: [
				{
					area: { amount: 16, unit: 'mm' },
					averageDepth: { amount: 2, unit: 'mm' },
					created: new Date('2021-08-16').toISOString(),
				},
			],
			patientComments:
				"The pain has been persistent, and I'm concerned about any potential complications. ",
			glucoseLiveReadings: 16,
			images: [
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
				{ bucket: 'bucket', key: 'key' },
			],
			rgb: { bucket: 'bucket', key: 'key' },
		} as Scan,
	],
};

export default patient;
