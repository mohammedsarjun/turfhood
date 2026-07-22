import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, type ApiErrorResponse } from '@/types/api/response';
import { API_ROUTES } from '@/lib/apiRoutes';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Endpoints where a 401 means "these credentials are wrong" — not "session expired" — so
 * they must never trigger a refresh-and-retry (that would mask the real error and waste a call).
 */
const AUTH_ENDPOINTS: string[] = [
  API_ROUTES.auth.login,
  API_ROUTES.auth.google,
  API_ROUTES.auth.signUp,
  API_ROUTES.auth.otpVerify,
  API_ROUTES.admin.login,
  API_ROUTES.users.refresh,
  API_ROUTES.admin.refresh,
];

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean };

/** Single in-flight refresh promise so concurrent 401s share one refresh call, not one each. */
let refreshPromise: Promise<void> | null = null;

function refreshSessionOnce(isAdminRequest: boolean): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axiosInstance
      .post(isAdminRequest ? API_ROUTES.admin.refresh : API_ROUTES.users.refresh)
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Normalizes every failure (validation, server, or network) into a single ApiError shape.
// Also transparently refreshes an expired access token once and retries the original request.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retriedAfterRefresh &&
      !AUTH_ENDPOINTS.includes(originalRequest.url ?? '')
    ) {
      originalRequest._retriedAfterRefresh = true;
      try {
        await refreshSessionOnce(Boolean(originalRequest.url?.startsWith('/admin')));
        return await axiosInstance(originalRequest);
      } catch {
        // Refresh itself failed (or the retry failed again) — fall through to normal handling
        // below, which reports the *original* error to the caller.
      }
    }

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
