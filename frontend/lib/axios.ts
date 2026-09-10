import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { AuthErrorCode } from '@turfhood/shared';
import { ApiError, type ApiErrorResponse } from '@/types/api/response';
import { API_ROUTES } from '@/lib/apiRoutes';
import { isAdminRoute } from '@/lib/auth/routeGuard';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
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
let userRefreshPromise: Promise<void> | null = null;
let adminRefreshPromise: Promise<void> | null = null;

function refreshSessionOnce(isAdminRequest: boolean): Promise<void> {
  const currentPromise = isAdminRequest ? adminRefreshPromise : userRefreshPromise;
  if (currentPromise) return currentPromise;

  const refreshPromise = axiosInstance
    .post(isAdminRequest ? API_ROUTES.admin.refresh : API_ROUTES.users.refresh)
    .then(() => undefined)
    .finally(() => {
      if (isAdminRequest) adminRefreshPromise = null;
      else userRefreshPromise = null;
    });

  if (isAdminRequest) adminRefreshPromise = refreshPromise;
  else userRefreshPromise = refreshPromise;
  return refreshPromise;
}

const ACCESS_TOKEN_ERROR_CODES = new Set<string>([
  AuthErrorCode.TOKEN_MISSING,
  AuthErrorCode.TOKEN_INVALID,
  AuthErrorCode.TOKEN_EXPIRED,
]);

function redirectToLogin(isAdminRequest: boolean): void {
  if (typeof window === 'undefined') return;
  const loginPath = isAdminRequest ? '/admin/login' : '/login';
  const publicUserPaths = ['/login', '/signup', '/forgot-password', '/otp'];
  if (!isAdminRequest && publicUserPaths.includes(window.location.pathname)) return;
  if (window.location.pathname !== loginPath) window.location.replace(loginPath);
}

// Normalizes every failure (validation, server, or network) into a single ApiError shape.
// Also transparently refreshes an expired access token once and retries the original request.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      ACCESS_TOKEN_ERROR_CODES.has(error.response.data.code ?? '') &&
      originalRequest &&
      !originalRequest._retriedAfterRefresh &&
      !AUTH_ENDPOINTS.includes(originalRequest.url ?? '')
    ) {
      originalRequest._retriedAfterRefresh = true;
      const isAdminRequest =
        Boolean(originalRequest.url?.startsWith('/admin')) ||
        (typeof window !== 'undefined' && isAdminRoute(window.location.pathname));
      let sessionRefreshed = false;
      try {
        await refreshSessionOnce(isAdminRequest);
        sessionRefreshed = true;
      } catch {
        redirectToLogin(isAdminRequest);
        // Fall through so the caller receives the original authentication error.
      }
      if (sessionRefreshed) return axiosInstance(originalRequest);
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
