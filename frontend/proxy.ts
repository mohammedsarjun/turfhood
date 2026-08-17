import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyAdminAccessToken,
  verifyAccessToken,
  verifyOtpSessionToken,
} from '@/lib/auth/session';
import {
  resolveAdminGuardRedirect,
  resolveGuardRedirect,
  resolveOtpGuardRedirect,
  isAuthRoute,
  isAdminRoute,
  isProtectedRoute,
} from '@/lib/auth/routeGuard';
import { API_ROUTES } from '@/lib/apiRoutes';

const ADMIN_ACCESS_COOKIE = 'adminAccessToken';
const ADMIN_REFRESH_COOKIE = 'adminRefreshToken';
const USER_ACCESS_COOKIE = 'accessToken';
const USER_REFRESH_COOKIE = 'refreshToken';
const REFRESH_TIMEOUT_MS = 5_000;
type SessionRefreshResult = { setCookieHeaders: string[] };
type SessionRefreshConfig = {
  accessCookie: string;
  refreshCookie: string;
  endpoint: string;
  requests: Map<string, Promise<SessionRefreshResult | null>>;
};
const adminRefreshRequests = new Map<string, Promise<SessionRefreshResult | null>>();
const userRefreshRequests = new Map<string, Promise<SessionRefreshResult | null>>();
const adminRefreshConfig: SessionRefreshConfig = {
  accessCookie: ADMIN_ACCESS_COOKIE,
  refreshCookie: ADMIN_REFRESH_COOKIE,
  endpoint: API_ROUTES.admin.refresh,
  requests: adminRefreshRequests,
};
const userRefreshConfig: SessionRefreshConfig = {
  accessCookie: USER_ACCESS_COOKIE,
  refreshCookie: USER_REFRESH_COOKIE,
  endpoint: API_ROUTES.users.refresh,
  requests: userRefreshRequests,
};

function redirectToAdminLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  response.cookies.delete(ADMIN_ACCESS_COOKIE);
  response.cookies.delete(ADMIN_REFRESH_COOKIE);
  return response;
}

function clearUserSession(response: NextResponse): NextResponse {
  response.cookies.delete(USER_ACCESS_COOKIE);
  response.cookies.delete(USER_REFRESH_COOKIE);
  return response;
}

async function requestSessionRefresh(
  refreshToken: string,
  config: SessionRefreshConfig,
): Promise<SessionRefreshResult | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return null;

  try {
    const refreshResponse = await fetch(`${apiBaseUrl}${config.endpoint}`, {
      method: 'POST',
      headers: { cookie: `${config.refreshCookie}=${encodeURIComponent(refreshToken)}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });

    if (!refreshResponse.ok) return null;

    const setCookieHeaders = refreshResponse.headers.getSetCookie();
    const hasAccessCookie = setCookieHeaders.some((cookie) =>
      cookie.startsWith(`${config.accessCookie}=`),
    );
    const hasRefreshCookie = setCookieHeaders.some((cookie) =>
      cookie.startsWith(`${config.refreshCookie}=`),
    );
    return hasAccessCookie && hasRefreshCookie ? { setCookieHeaders } : null;
  } catch {
    return null;
  }
}

async function recoverSession(
  request: NextRequest,
  config: SessionRefreshConfig,
): Promise<SessionRefreshResult | null> {
  const refreshToken = request.cookies.get(config.refreshCookie)?.value;
  if (!refreshToken) return null;

  let refreshRequest = config.requests.get(refreshToken);
  if (!refreshRequest) {
    refreshRequest = requestSessionRefresh(refreshToken, config);
    config.requests.set(refreshToken, refreshRequest);
    void refreshRequest.finally(() => {
      if (config.requests.get(refreshToken) === refreshRequest) {
        config.requests.delete(refreshToken);
      }
    });
  }

  return refreshRequest;
}

function attachSessionCookies(
  response: NextResponse,
  result: SessionRefreshResult,
): NextResponse {
  for (const cookie of result.setCookieHeaders) {
    response.headers.append('set-cookie', cookie);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isAdminRoute(pathname)) {
    const adminSession = await verifyAdminAccessToken(
      request.cookies.get(ADMIN_ACCESS_COOKIE)?.value,
    );
    const adminRedirectTo = resolveAdminGuardRedirect(pathname, adminSession !== null);

    if (adminSession) {
      return adminRedirectTo
        ? NextResponse.redirect(new URL(adminRedirectTo, request.url))
        : NextResponse.next();
    }

    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const refreshedSession = await recoverSession(request, adminRefreshConfig);
    if (refreshedSession) {
      const response =
        pathname === '/admin'
          ? NextResponse.redirect(new URL('/admin/dashboard', request.url))
          : NextResponse.next();
      return attachSessionCookies(response, refreshedSession);
    }

    return redirectToAdminLogin(request);
  }

  const hadUserCookie =
    request.cookies.has(USER_ACCESS_COOKIE) || request.cookies.has(USER_REFRESH_COOKIE);
  const userSession = await verifyAccessToken(request.cookies.get(USER_ACCESS_COOKIE)?.value);
  const userRedirectTo = resolveGuardRedirect(pathname, userSession !== null);

  if (userSession) {
    if (userRedirectTo) {
      return NextResponse.redirect(new URL(userRedirectTo, request.url));
    }
  } else if (isProtectedRoute(pathname) || isAuthRoute(pathname)) {
    const recoveredSession = await recoverSession(request, userRefreshConfig);
    if (recoveredSession) {
      const response = isAuthRoute(pathname)
        ? NextResponse.redirect(new URL('/', request.url))
        : NextResponse.next();
      return attachSessionCookies(response, recoveredSession);
    }

    if (isProtectedRoute(pathname)) {
      return clearUserSession(NextResponse.redirect(new URL('/login', request.url)));
    }
  }

  const otpSession = await verifyOtpSessionToken(request.cookies.get('otpSession')?.value);
  const otpRedirectTo = resolveOtpGuardRedirect(pathname, otpSession !== null);

  if (otpRedirectTo) {
    const response = NextResponse.redirect(new URL(otpRedirectTo, request.url));
    return hadUserCookie ? clearUserSession(response) : response;
  }

  const response = NextResponse.next();
  return !userSession && isAuthRoute(pathname) && hadUserCookie
    ? clearUserSession(response)
    : response;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/otp',
    '/profile',
    '/my-turfs',
    '/become-a-turf-owner',
    '/become-a-turf-owner/apply',
    '/admin',
    '/admin/:path*',
  ],
};
