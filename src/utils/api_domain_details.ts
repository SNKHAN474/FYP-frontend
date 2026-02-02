import { authConstants } from '../auth/constants';

const apiDomainDetails = () => {
  let domain: string;
  if (window.location.origin.indexOf('localhost') > 0) {
    domain = authConstants.staging.apiDomain;
  } else if (window.location.origin.indexOf('test') > 0) {
    domain = authConstants.staging.apiDomain;
  } else {
    domain = authConstants.prod.apiDomain;
  }
  return domain;
};

const apiDomain = apiDomainDetails();

export default apiDomain;
