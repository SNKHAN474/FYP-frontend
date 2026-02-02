import create, { SetState } from 'zustand';
import {produce} from 'immer';
import { Patient } from '../types/PatientTypes';
import { Scan, Annotation } from '../types/ScanTypes';

export interface UserProfile {
  name: string;
  email?: string;
  showNewFeatureModal: boolean;
}

export interface PatientStore {
  patients: Array<Patient>;
  scans: Array<Scan>;
  annotations: Array<Annotation>;
  searchTerm: string;
  isLoading: boolean;
  selectedPatient: Patient | undefined;
  userProfile: UserProfile | undefined;
  selectedCountry: string;
  setPatients: (patients: Array<Patient>) => void;
  setScans: (scans: Array<Scan>) => void;
  setAnnotations: (annotations: Array<Annotation>) => void;
  setSearchTerm: (searchTerm: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedPatient: (patient: Patient) => void;
  setUserProfile: (userProfile: UserProfile) => void;
  setSelectedCountry: (country: string) => void;
}

export const usePatientStore = create<PatientStore>((set: SetState<PatientStore>) => ({
  patients: [],
  scans: [],
  annotations: [],
  searchTerm: '',
  isLoading: true,
  selectedPatient: undefined,
  userProfile: undefined,
  selectedCountry: '',
  setPatients: (patients: Array<Patient>) => {
    set(
      produce((state: PatientStore) => {
        state.patients = patients;
      })
    );
  },
  setScans: (scans: Array<Scan>) => {
    set(
      produce((state: PatientStore) => {
        state.scans = scans;
      })
    );
  },
  setAnnotations: (annotations: Array<Annotation>) => {
    set(
      produce((state: PatientStore) => {
        state.annotations = annotations;
      })
    );
  },
  setSearchTerm: (searchTerm: string) => {
    set(
      produce((state: PatientStore) => {
        state.searchTerm = searchTerm;
      })
    );
  },
  setIsLoading: (isLoading: boolean) => {
    set(
      produce((state: PatientStore) => {
        state.isLoading = isLoading;
      })
    );
  },
  setSelectedPatient: (patient: Patient) => {
    set(
      produce((state: PatientStore) => {
        state.selectedPatient = patient;
      })
    );
  },
  setUserProfile: (userProfile: UserProfile) => {
    set(
      produce((state: PatientStore) => {
        state.userProfile = userProfile;
      })
    );
  },
  setSelectedCountry: (country: string) => {
    set(
      produce((state: PatientStore) => {
        state.selectedCountry = country;
      })
    );
  },
}));
