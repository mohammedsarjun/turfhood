/** Paths that require a valid session; unauthenticated visitors are redirected to /login. */
export const PROTECTED_ROUTES = ['/'];

/** Paths that only make sense for a logged-out visitor; authenticated users are sent home. */
export const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

/** Paths that require a valid pending-otp session; visited without one, they redirect to /login. */
export const OTP_SESSION_ROUTES = ['/otp'];

/** Pure route-guard decision: where (if anywhere) a request for `pathname` should be redirected. */
export function resolveGuardRedirect(pathname: string, isAuthenticated: boolean): string | null {
  if (PROTECTED_ROUTES.includes(pathname) && !isAuthenticated) {
    return '/login';
  }
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    return '/';
  }
  return null;
}

/** Pure route-guard decision for the OTP page: no valid pending-otp session means nothing to verify. */
export function resolveOtpGuardRedirect(pathname: string, hasOtpSession: boolean): string | null {
  if (OTP_SESSION_ROUTES.includes(pathname) && !hasOtpSession) {
    return '/login';
  }
  return null;
}
