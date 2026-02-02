import apiDomain from '../utils/api_domain_details';

export const getPatientsConfig = (token: string) => {
  return {
    url: `${apiDomain}/v1/patients?size=100&page=0`,
    method: 'get',
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getPatientByIdConfig = (token: string, patientId: string | undefined) => {
  return {
    url: `${apiDomain}/v1/patients/${patientId}`,
    method: 'get',
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const createPatientConfig = (token: string) => {
  return {
    url: `${apiDomain}/v1/patients`,
    method: 'post',
    headers: { Authorization: `Bearer ${token}`, 'Content-type': 'application/json', Accept: 'application/json' },
  };
};

export const createAnnotationConfig = (token: string) => {
  return {
    url: `${apiDomain}/v1/annotations`,
    method: 'post',
    headers: { Authorization: `Bearer ${token}`, 'Content-type': 'application/json', Accept: 'application/json' },
  };
};

export const updatePatientByIdConfig = (token: string, patientId: string) => {
  return {
    url: `${apiDomain}/v1/patients/${patientId}`,
    method: 'patch',
    headers: { Authorization: `Bearer ${token}`, 'Content-type': 'application/json', Accept: 'application/json' },
  };
};

export const userMetadataUpdateConfig = (token: string) => {
  return {
    url: `${apiDomain}/v1/user`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
};
