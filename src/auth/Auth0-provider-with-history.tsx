import React from 'react';
// import { useHistory } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import auth0Details from '../utils/auth0_details';

type Props = {
  children?: React.ReactNode
};

const Auth0ProviderWithHistory: React.FC<Props> = ({ children }) => {

  return (
    <Auth0Provider
      domain={auth0Details().domain}
      clientId={auth0Details().clientId}
      redirectUri={ auth0Details().redirectUri}
      //onRedirectCallback={onRedirectCallback}
      audience={auth0Details().audience}
      scope={auth0Details().scopes}
      useRefreshTokens={true}
      //onRedirectCallback={onRedirectCallback}
      //cacheLocation={"localstorage"}
      //responseType="id_token"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
