export const authConstants = {
  prod: {
    auth0_domain: 'mig-test.uk.auth0.com',
    clientId: 'hbl56SXH3jy4X1Yx21GebbVwDivQR8PO', //w8ADcaNUtdCZ9PNq9AE6hGvxsYTncTZ2
    audience: 'https://api.test.mig.com',
    managementAudience: 'https://mig-test.uk.auth0.com',
    apiDomain: 'https://tasha-0-13.onrender.com',
  },
  staging: {
    auth0_domain: 'mig-test.uk.auth0.com',
    clientId: 'hbl56SXH3jy4X1Yx21GebbVwDivQR8PO', //w8ADcaNUtdCZ9PNq9AE6hGvxsYTncTZ2
    audience: 'https://api.test.mig.com',
    managementAudience: 'https://mig-test.uk.auth0.com',
    apiDomain: 'https://tasha-0-13.onrender.com', //https://tasha-0-5.onrender.com
  },
  scopes: [
    'email',
    'openid',
    'crete:patient',
    'list:patients',
    'get:patient',
    'update:patient',
    'create:scan',
    'list:scans',
    'get:scan',
    'create:annotation',
    'list:annotations',
    'get:annotation'
  ].join(' '),
};
