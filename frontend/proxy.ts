import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken, verifyOtpSessionToken } from '@/lib/auth/session';
import { resolveGuardRedirect, resolveOtpGuardRedirect } from '@/lib/auth/routeGuard';

export async function proxy(request: NextRequest) {
  const session = await verifyAccessToken(request.cookies.get('accessToken')?.value);
  const redirectTo = resolveGuardRedirect(request.nextUrl.pathname, session !== null);

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  const otpSession = await verifyOtpSessionToken(request.cookies.get('otpSession')?.value);
  const otpRedirectTo = resolveOtpGuardRedirect(request.nextUrl.pathname, otpSession !== null);

  if (otpRedirectTo) {
    return NextResponse.redirect(new URL(otpRedirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/forgot-password', '/otp'],
};
