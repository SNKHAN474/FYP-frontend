import { authConstants } from '../auth/constants';

const auth0Details = () => {
  let domain: string;
  let clientId: string;
  let audience: string;
  let managementAudience: string;
  let redirectUri: string = `${window.location.origin}`;
  if (window.location.origin.indexOf('localhost') > 0) {
    domain = authConstants.staging.auth0_domain;
    clientId = authConstants.staging.clientId;
    audience = authConstants.staging.audience;
    managementAudience = authConstants.staging.managementAudience;
  } else if (window.location.origin.indexOf('test') > 0) {
    domain = authConstants.staging.auth0_domain;
    clientId = authConstants.staging.clientId;
    audience = authConstants.staging.audience;
    managementAudience = authConstants.staging.managementAudience;
  } else {
    domain = authConstants.staging.auth0_domain;
    clientId = authConstants.staging.clientId;
    audience = authConstants.staging.audience;
    managementAudience = authConstants.staging.managementAudience;
  }
  return {
    domain,
    clientId,
    audience,
    managementAudience,
    redirectUri,
    scopes: authConstants.scopes,
  };
};

export default auth0Details;
