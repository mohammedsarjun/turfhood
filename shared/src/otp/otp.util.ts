/** Masks an email for display, e.g. "jo•••••@example.com". */
export function maskEmail(email: string): string {
  return email.replace(/^(..).*(@.*)$/, '$1•••••$2');
}
