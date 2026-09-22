const FALLBACK_AUTH_REDIRECT = '/';

export function getSafeAuthRedirect(value: string | null | undefined): string {
  if (!value) return FALLBACK_AUTH_REDIRECT;

  try {
    const decoded = decodeURIComponent(value);
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return FALLBACK_AUTH_REDIRECT;
    if (decoded.startsWith('/login') || decoded.startsWith('/signup') || decoded.startsWith('/otp')) {
      return FALLBACK_AUTH_REDIRECT;
    }
    return decoded;
  } catch {
    return FALLBACK_AUTH_REDIRECT;
  }
}

export function withNextParam(pathname: string): string {
  return `next=${encodeURIComponent(pathname)}`;
}
