import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import auth0_details from '../utils/auth0_details';

export const useToken = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isTokenLoading, setIsTokenLoading] = useState<boolean>(true);

  useEffect(() => {
  let counter: number = 0;
  let accessToken: string | undefined = undefined;
  let repeatFunc: any;

    const getToken = async () => {
      try {
        if (isAuthenticated) {          
          //console.log('before auth0 getAccessTokenSilently ');
          accessToken = await getAccessTokenSilently({
            audience: auth0_details().audience,
            scope: auth0_details().scopes,
          });
          //console.log('after auth0 getAccessTokenSilently ');
          setToken(accessToken);
          setIsTokenLoading(false);
        }
      } catch (e: any) {
        console.error(e.message);
      }
    };
    getToken();
    if(!isAuthenticated) {
      repeatFunc = setInterval(() => repeatGetToken(), 1000);
    }

    const repeatGetToken = () => {
      counter++;
      getToken();
      if(!!accessToken || counter > 3)
      {
        //console.log("token value", counter, accessToken);
        clearInterval(repeatFunc);
        setIsTokenLoading(false);
      }
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return {isTokenLoading, token };
};
