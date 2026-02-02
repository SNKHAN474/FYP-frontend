import axios, { AxiosError } from 'axios';

type ErrorResponse = {
  errorMsg: string;
}

type RequestParams = {
  url: string;
  method: any;
  params?: any;
  body?: any;
  headers?: any;
}

export const axiosClient = async ({
  url,
  method,
  params,
  body = null,
  headers = null,
}: RequestParams): Promise<Array<any> | any | ErrorResponse> => {
  const result = await axios({ url, method, headers, params, data: body })
    .then((res: any) => {
      //console.log('Axios Client Response: ', res);
      if (res.data.content) return res.data.content;
      else return res.data;
    })
    .catch((err: Error | AxiosError) => {
      let errorResponse: ErrorResponse;

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const { data } = err.response;
          console.log({ data }, { err }, 'thursday');

          const errorObject: { message: string; status: string } = data.error
            ? JSON.parse(data.error.split(' - ')[1])
            : {
                message: `Unknown error - code : ${err.response.status}`,
                status: err.response.status,
              };

          const status = Number.parseInt(errorObject['status'], 10);
          //   let status: number = err.response.status;
          switch (true) {
            case status === 400:
              errorResponse = {
                errorMsg: `Issue with submitted data. ${errorObject['message']}`,
              };
              break;
            case status === 401:
              errorResponse = {
                errorMsg: `Issue with authentication/authorization. ${errorObject['message']}`,
              };
              break;
            case status === 404:
              errorResponse = {
                errorMsg: `Resource Not Found. ${errorObject['message']}`,
              };
              break;
            case status >= 500:
              errorResponse = {
                errorMsg: `Server side error. ${errorObject['message']}`,
              };
              break;
            default:
              errorResponse = {
                errorMsg: 'There was some unknown error on server side.',
              };
          }

          return errorResponse;
        } else if (err.request) {
          return (errorResponse = {
            errorMsg: 'There was some err on the client side. Could not reach out to server.',
          });
        }
      } else {
        return (errorResponse = {
          errorMsg: 'Some Unknown error seems to have occurred.',
        });
      }
    });
  return result;
};
