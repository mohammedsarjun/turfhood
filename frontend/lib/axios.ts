import axios, { type AxiosError } from 'axios';
import { ApiError, type ApiErrorResponse } from '@/types/api/response';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalizes every failure (validation, server, or network) into a single ApiError shape.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { message, errors, code } = error.response.data;
      return Promise.reject(
        new ApiError(
          message ?? 'Something went wrong. Please try again later.',
          error.response.status,
          errors,
          code,
        ),
      );
    }

    if (error.request) {
      return Promise.reject(
        new ApiError('Unable to reach the server. Check your connection and try again.', 0),
      );
    }

    return Promise.reject(new ApiError(error.message, 0));
  },
);
