import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyAccessToken,
  verifyAdminAccessToken,
  verifyAdminRefreshToken,
  verifyOtpSessionToken,
  verifyRefreshToken,
} from '@/lib/auth/session';
import {
  resolveAdminGuardRedirect,
  resolveGuardRedirect,
  resolveOtpGuardRedirect,
} from '@/lib/auth/routeGuard';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin')) {
    const adminSession = await verifyAdminAccessToken(
      request.cookies.get('adminAccessToken')?.value,
    );
    // Access token may have expired (15m) while the session is still good — the axios
    // interceptor renews it on the next API call, so a valid refresh token is enough here.
    const hasAdminRefresh = await verifyAdminRefreshToken(
      request.cookies.get('adminRefreshToken')?.value,
    );
    const adminRedirectTo = resolveAdminGuardRedirect(
      pathname,
      adminSession !== null || hasAdminRefresh,
    );

    if (adminRedirectTo) {
      return NextResponse.redirect(new URL(adminRedirectTo, request.url));
    }

    return NextResponse.next();
  }

  const session = await verifyAccessToken(request.cookies.get('accessToken')?.value);
  const hasRefresh = await verifyRefreshToken(request.cookies.get('refreshToken')?.value);
  const redirectTo = resolveGuardRedirect(pathname, session !== null || hasRefresh);

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  const otpSession = await verifyOtpSessionToken(request.cookies.get('otpSession')?.value);
  const otpRedirectTo = resolveOtpGuardRedirect(pathname, otpSession !== null);

  if (otpRedirectTo) {
    return NextResponse.redirect(new URL(otpRedirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/forgot-password', '/otp', '/profile', '/admin/:path*'],
};
