import axios, { type AxiosError } from 'axios';
import { ApiError, type ApiErrorResponse } from '@/types/api/response';
import { tokenStorage } from './tokenStorage';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attaches the stored access token, if any, to every outgoing request.
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes every failure (validation, server, or network) into a single ApiError shape.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { message, errors } = error.response.data;
      return Promise.reject(
        new ApiError(message ?? 'Something went wrong. Please try again later.', error.response.status, errors)
      );
    }

    if (error.request) {
      return Promise.reject(new ApiError('Unable to reach the server. Check your connection and try again.', 0));
    }

    return Promise.reject(new ApiError(error.message, 0));
  }
);
