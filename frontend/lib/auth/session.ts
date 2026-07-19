import { jwtVerify } from 'jose';
import type { AuthTokenPayload, OtpSessionPayload } from '@turfhood/shared';

/**
 * Verifies the accessToken cookie's signature and expiry using `jose` (Edge/Node-compatible,
 * unlike `jsonwebtoken`) so proxy.ts can do a real session check, not just a presence check.
 */
export async function verifyAccessToken(token: string | undefined): Promise<AuthTokenPayload | null> {
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
