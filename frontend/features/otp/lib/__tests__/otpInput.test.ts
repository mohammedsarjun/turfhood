import {
  OTP_LENGTH,
  buildOtpFromDigits,
  isOtpComplete,
  isValidOtpDigit,
  maskEmail,
  nextFocusIndexOnBackspace,
  nextFocusIndexOnInput,
  parseOtpPaste,
  sanitizeDigit,
} from '../otpInput';

describe('isValidOtpDigit', () => {
  it('returns true for a single digit character', () => {
    expect(isValidOtpDigit('5')).toBe(true);
  });

  it('returns false for a non-digit character', () => {
    expect(isValidOtpDigit('a')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidOtpDigit('')).toBe(false);
  });
});

describe('sanitizeDigit', () => {
  it('strips non-digit characters', () => {
    expect(sanitizeDigit('a1b')).toBe('1');
  });

  it('keeps only the last character when multiple digits are typed', () => {
    expect(sanitizeDigit('12')).toBe('2');
  });

  it('returns an empty string for non-digit-only input', () => {
    expect(sanitizeDigit('abc')).toBe('');
  });
});

describe('buildOtpFromDigits', () => {
  it('joins digits into a single string', () => {
    expect(buildOtpFromDigits(['1', '2', '3', '4', '5', '6'])).toBe('123456');
  });
});

describe('isOtpComplete', () => {
  it('returns true when every box has exactly one digit', () => {
    expect(isOtpComplete(['1', '2', '3', '4', '5', '6'])).toBe(true);
  });

  it('returns false when a box is empty', () => {
    expect(isOtpComplete(['1', '2', '', '4', '5', '6'])).toBe(false);
  });

  it('returns false when the array is shorter than the expected length', () => {
    expect(isOtpComplete(['1', '2', '3'])).toBe(false);
  });
});

describe('parseOtpPaste', () => {
  it('splits an exact-length pasted code into individual digits', () => {
    expect(parseOtpPaste('123456')).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('pads remaining boxes when the pasted text is shorter than expected', () => {
    expect(parseOtpPaste('123')).toEqual(['1', '2', '3', '', '', '']);
  });

  it('truncates when the pasted text is longer than expected', () => {
    expect(parseOtpPaste('12345678')).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('strips non-digit characters before splitting', () => {
    expect(parseOtpPaste('12-34-56')).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('returns all-empty boxes for a paste with no digits', () => {
    expect(parseOtpPaste('abcdef')).toEqual(['', '', '', '', '', '']);
  });
});

describe('nextFocusIndexOnInput', () => {
  it('advances to the next box after typing a digit', () => {
    expect(nextFocusIndexOnInput(0, '5')).toBe(1);
  });

  it('returns null when at the last box', () => {
    expect(nextFocusIndexOnInput(OTP_LENGTH - 1, '5')).toBeNull();
  });

  it('returns null when the digit was cleared (backspace via onChange)', () => {
    expect(nextFocusIndexOnInput(2, '')).toBeNull();
  });
});

describe('nextFocusIndexOnBackspace', () => {
  it('returns null when the current box still had a value (just clears it)', () => {
    expect(nextFocusIndexOnBackspace(3, true)).toBeNull();
  });

  it('moves back one box when the current box was already empty', () => {
    expect(nextFocusIndexOnBackspace(3, false)).toBe(2);
  });

  it('returns null when already at the first box and empty', () => {
    expect(nextFocusIndexOnBackspace(0, false)).toBeNull();
  });
});

describe('maskEmail', () => {
  it('masks the local part between the first two characters and the domain', () => {
    expect(maskEmail('jordan@example.com')).toBe('jo•••••@example.com');
  });
});
