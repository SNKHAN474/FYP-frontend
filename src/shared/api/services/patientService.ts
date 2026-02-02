import { createPatientConfig, getPatientByIdConfig, updatePatientByIdConfig } from '../../../api/apiConfig';
import { Patient, PatientWithoutScans } from '../../../types/PatientTypes';
import { axiosClient } from '../../../utils/axiosClient';

type PatientData = Omit<PatientWithoutScans, 'sequenceNumber' | 'bmi'>;

export const getPatient = async (token: string, patientId: string): Promise<Patient> => {
	const result: Patient = await axiosClient(getPatientByIdConfig(token, patientId));
	//console.log('Patient result', result);
	return result;
};

//export const getPatients = (): PatientWithoutScansAndNotes[] => patients;

export const createPatient = async (token: string, patient: Omit<PatientData, 'id'>) => {
	const createPatientConfigWithBody = {
        ...createPatientConfig(token),
        body: patient,
      };

    const result: any = await axiosClient(createPatientConfigWithBody);
	console.log(result);
};

export const updatePatient = async (token: string, patient: PatientData) => {

      const updatePatientConfigWithBody = {
        ...updatePatientByIdConfig(token, patient.id),
        body: patient,
      };

    	await axiosClient(updatePatientConfigWithBody);
	  //console.log('Update result', result);
};

export const updatePatientNotes = (patient: Pick<Patient, 'id' | 'clinicianNotes'>) => {
	console.log(patient);
};
