import { hasLetter, hasMinLength, hasNumber, passwordsMatch } from '../passwordRules';

describe('hasMinLength', () => {
  it('returns true for a password of exactly 8 characters', () => {
    expect(hasMinLength('12345678')).toBe(true);
  });

  it('returns false for a password shorter than 8 characters', () => {
    expect(hasMinLength('1234567')).toBe(false);
  });
});

describe('hasLetter', () => {
  it('returns true when the password contains a letter', () => {
    expect(hasLetter('abc12345')).toBe(true);
  });

  it('returns false when the password has no letters', () => {
    expect(hasLetter('12345678')).toBe(false);
  });
});

describe('hasNumber', () => {
  it('returns true when the password contains a digit', () => {
    expect(hasNumber('abcdefg1')).toBe(true);
  });

  it('returns false when the password has no digits', () => {
    expect(hasNumber('abcdefgh')).toBe(false);
  });
});

describe('passwordsMatch', () => {
  it('returns true when both values are non-empty and identical', () => {
    expect(passwordsMatch('password1', 'password1')).toBe(true);
  });

  it('returns false when the values differ', () => {
    expect(passwordsMatch('password1', 'password2')).toBe(false);
  });

  it('returns false when both values are empty', () => {
    expect(passwordsMatch('', '')).toBe(false);
  });
});
