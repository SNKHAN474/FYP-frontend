type ErrorResponse = {
  errorMsg: string;
}

export const isErrorResponse = (object: any): object is ErrorResponse => {
  return object['errorMsg'];
};
