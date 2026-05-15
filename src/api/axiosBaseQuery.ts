import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { instance as axiosInstance } from "./axios";
export const axiosBaseQuery =
    (
        { baseUrl }: { baseUrl: string } = { baseUrl: "" }
    ): BaseQueryFn<
        {
            url: string;
            method: AxiosRequestConfig["method"];
            data?: AxiosRequestConfig["data"];
            params?: AxiosRequestConfig["params"];
            meta?: any;
            contentType?: string;
        },
        unknown,
        unknown
    > =>
        async ({ url, method, data, params, contentType }) => {
            try {
                console.log(data, url, "axios");

                const result = await axiosInstance({
                    url: baseUrl + url,
                    method,
                    data,
                    params,
                    headers: {
                        "Content-Type": contentType || "application/json",
                    },
                    timeout: 10000
                });
                return { data: result.data };
            } catch (axiosError) {
                const err = axiosError as AxiosError;
                console.log(err, "axios");

                return {
                    error: {
                        status: err.response?.status,
                        data: err.response?.data || err.message,
                    },
                };
            }
        };