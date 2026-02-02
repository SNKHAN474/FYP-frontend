import axios, { type AxiosError } from "axios";

type SuccessResponse<V> = {
  code: "success";
  data: V;
};

type ErrorResponse<E = AxiosError> = {
  code: "error";
  error: E;
};

type BaseResponse<V, E> = Promise<SuccessResponse<V> | ErrorResponse<E>>;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

type Args = {
  path: string;
} & ConditionalArgs;

type ConditionalArgs =
  | { method: "post" | "put"; body: Record<string, unknown> }
  | {
      method: "get" | "delete";
      body?: undefined;
    };

export default async function requestHandler<V, E = AxiosError>({
  method,
  path,
  body = {},
}: Args): BaseResponse<V, E> {
  try {
    const res = await axiosInstance[method](path, body);
    return { code: "success", data: res.data };
  } catch (e) {
    return { code: "error", error: e as E };
  }
}
