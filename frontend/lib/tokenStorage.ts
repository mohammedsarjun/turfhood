const ACCESS_TOKEN_KEY = 'turfhub_access_token';

/**
 * Minimal localStorage-backed persistence for the JWT access token returned by login.
 * Deliberately does not handle refresh tokens, silent refresh, or auth-guard/redirect logic.
 */
export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
