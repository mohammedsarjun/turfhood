export const OTP_LENGTH = 6;

/** True for a single character that is exactly one digit. */
export function isValidOtpDigit(char: string): boolean {
  return /^\d$/.test(char);
}

/** Strips non-digits from raw input and keeps only the last character typed. */
export function sanitizeDigit(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, '');
  return digitsOnly.slice(-1);
}

export function buildOtpFromDigits(digits: string[]): string {
  return digits.join('');
}

export function isOtpComplete(digits: string[], length: number = OTP_LENGTH): boolean {
  return digits.length === length && digits.every((digit) => isValidOtpDigit(digit));
}

/** Splits pasted text into per-box digits, padding any remaining boxes with ''. */
export function parseOtpPaste(clipboardText: string, length: number = OTP_LENGTH): string[] {
  const digitsOnly = clipboardText.replace(/\D/g, '').slice(0, length);
  return Array.from({ length }, (_, index) => digitsOnly[index] ?? '');
}

/** Returns the index to focus after typing a digit, or null if already at the last box. */
export function nextFocusIndexOnInput(
  currentIndex: number,
  digit: string,
  length: number = OTP_LENGTH
): number | null {
  if (!digit) return null;
  return currentIndex < length - 1 ? currentIndex + 1 : null;
}

/** Returns the index to focus after Backspace, or null if there's nowhere to go back to. */
export function nextFocusIndexOnBackspace(currentIndex: number, hadValue: boolean): number | null {
  if (hadValue) return null;
  return currentIndex > 0 ? currentIndex - 1 : null;
}

/** Masks an email for display, e.g. "jo•••••@example.com". */
export function maskEmail(email: string): string {
  return email.replace(/^(..).*(@.*)$/, '$1•••••$2');
}
