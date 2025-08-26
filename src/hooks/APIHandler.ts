import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { toast } from "react-toastify";
import config from "../utils/config";

interface ApiCallOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, any>;
  header?: Record<string, string>;
  params?: Record<string, any>;
}

function useApi() {
  const [error, setError] = useState<AxiosError | string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const callApi = async ({
    url,
    method = "GET",
    body = {},
    header = {},
    params = {},
  }: ApiCallOptions): Promise<AxiosResponse | undefined> => {
    const gUrl = config.API_URL + url;
    setLoading(true);
    let response: AxiosResponse | undefined;

    const token = localStorage.getItem("token");
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }

    try {
      const options: AxiosRequestConfig = {
        url: gUrl,
        method,
        data: body,
        headers: header,
        params,
      };

      response = await axios.request(options);
    } catch (err) {
      const axiosError = err as AxiosError;

      console.error(axiosError);
      if (axiosError.response?.data) {
        const data = axiosError.response.data as any;
        let message = "An unknown error has occurred.";
        
        if (data.message) {
          // message can be string, array of strings, or array of objects
          if (typeof data.message === "string") {
            message = data.message;
          } else if (Array.isArray(data.message)) {
            message = data.message
              .map((m: any) => (typeof m === "string" ? m : m.message))
              .join(", ");
          }
        } else if (data.errors && Array.isArray(data.errors)) {
          message = data.errors.map((e: any) => e.message).join(", ");
        } else if (data.detail) {
          message = data.detail;
        }else if (data.status) {
          message = data.status[0];
        }else if (data.non_field_errors){
           message = data.non_field_errors[0]
        }
        toast.error(message);
      }

      setError(axiosError);
    } finally {
      setLoading(false);
    }

    return response;
  };

  return { callApi, error, loading };
}

export default useApi;
