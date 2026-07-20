import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyAccessToken,
  verifyAdminAccessToken,
  verifyOtpSessionToken,
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
    const adminRedirectTo = resolveAdminGuardRedirect(pathname, adminSession !== null);

    if (adminRedirectTo) {
      return NextResponse.redirect(new URL(adminRedirectTo, request.url));
    }

    return NextResponse.next();
  }

  const session = await verifyAccessToken(request.cookies.get('accessToken')?.value);
  const redirectTo = resolveGuardRedirect(pathname, session !== null);

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
