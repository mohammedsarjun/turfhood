const MIN_LENGTH = 8;
const HAS_LETTER = /[A-Za-z]/;
const HAS_NUMBER = /[0-9]/;

/** True when the password meets the minimum length requirement (8+ characters). */
export function hasMinLength(password: string): boolean {
  return password.length >= MIN_LENGTH;
}

/** True when the password contains at least one letter. */
export function hasLetter(password: string): boolean {
  return HAS_LETTER.test(password);
}

/** True when the password contains at least one number. */
export function hasNumber(password: string): boolean {
  return HAS_NUMBER.test(password);
}

/** True when both values are non-empty and identical. */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && password === confirmPassword;
}
