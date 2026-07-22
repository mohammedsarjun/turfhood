import { jwtVerify } from 'jose';
import type { AuthTokenPayload, OtpSessionPayload } from '@turfhood/shared';

/**
 * Verifies the accessToken cookie's signature and expiry using `jose` (Edge/Node-compatible,
 * unlike `jsonwebtoken`) so proxy.ts can do a real session check, not just a presence check.
 */
export async function verifyAccessToken(
  token: string | undefined,
): Promise<AuthTokenPayload | null> {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies the otpSession cookie the same way, so proxy.ts can gate /otp on an actual
 * pending verification instead of a client-editable URL query string.
 */
export async function verifyOtpSessionToken(
  token: string | undefined,
): Promise<OtpSessionPayload | null> {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if ((payload as unknown as OtpSessionPayload).typ !== 'otp_session') return null;
    return payload as unknown as OtpSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies the adminAccessToken cookie — a separate cookie from the regular accessToken, so
 * a regular user's session is never even inspected here. Also requires the 'admin' role claim,
 * matching the backend's adminOnly middleware, so a non-admin token never satisfies this check.
 */
export async function verifyAdminAccessToken(
  token: string | undefined,
): Promise<AuthTokenPayload | null> {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const authPayload = payload as unknown as AuthTokenPayload;
    if (!authPayload.roles?.includes('admin')) return null;
    return authPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies the refreshToken cookie's signature and expiry only — used solely to decide whether
 * proxy.ts should still treat the visitor as logged in once the short-lived access token has
 * expired. The actual token renewal (rotation, revocation check) happens server-side via the
 * axios interceptor calling /users/refresh — this never mints a new access token itself.
 */
export async function verifyRefreshToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/** Same as verifyRefreshToken, but for the separate adminRefreshToken cookie/role claim. */
export async function verifyAdminRefreshToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return Boolean((payload as unknown as AuthTokenPayload).roles?.includes('admin'));
  } catch {
    return false;
  }
}
