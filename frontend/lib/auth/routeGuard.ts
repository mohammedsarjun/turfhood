/** Paths that require a valid session; unauthenticated visitors are redirected to /login. */
export const PROTECTED_ROUTES = [
  '/',
  '/profile',
  '/my-turfs',
  '/become-a-turf-owner',
  '/become-a-turf-owner/apply',
];
const PROTECTED_ROUTE_PREFIXES = ['/turf-portal'];

/** Paths that only make sense for a logged-out visitor; authenticated users are sent home. */
export const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/otp'];

export function isProtectedRoute(pathname: string): boolean {
  return (
    PROTECTED_ROUTES.includes(pathname) ||
    PROTECTED_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

/** Paths that require a valid pending-otp session; visited without one, they redirect to /login. */
export const OTP_SESSION_ROUTES = ['/otp'];

/** Pure route-guard decision: where (if anywhere) a request for `pathname` should be redirected. */
export function resolveGuardRedirect(pathname: string, isAuthenticated: boolean): string | null {
  if (isProtectedRoute(pathname) && !isAuthenticated) {
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

const ADMIN_ROUTES_PREFIX = '/admin';
export const ADMIN_LOGIN_ROUTE = '/admin/login';
export const ADMIN_LANDING_ROUTE = '/admin/dashboard';

export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_ROUTES_PREFIX || pathname.startsWith(`${ADMIN_ROUTES_PREFIX}/`);
}

/**
 * Pure route-guard decision for the admin area, based only on the admin access token.
 * The proxy attempts refresh recovery before applying an unauthenticated redirect.
 */
export function resolveAdminGuardRedirect(
  pathname: string,
  isAdminAuthenticated: boolean,
): string | null {
  if (!isAdminRoute(pathname)) {
    return null;
  }
  if (pathname === ADMIN_LOGIN_ROUTE || pathname === ADMIN_ROUTES_PREFIX) {
    if (isAdminAuthenticated) return ADMIN_LANDING_ROUTE;
    return pathname === ADMIN_LOGIN_ROUTE ? null : ADMIN_LOGIN_ROUTE;
  }
  return isAdminAuthenticated ? null : ADMIN_LOGIN_ROUTE;
}
