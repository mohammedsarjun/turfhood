/** Masks an email for display, e.g. "jo•••••@example.com". */
export function maskEmail(email) {
    return email.replace(/^(..).*(@.*)$/, '$1•••••$2');
}
