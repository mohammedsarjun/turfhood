'use client';

import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import {
  OTP_LENGTH,
  nextFocusIndexOnBackspace,
  nextFocusIndexOnInput,
  parseOtpPaste,
  sanitizeDigit,
} from '../lib/otpInput';

interface OtpDigitInputProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  hasError?: boolean;
  disabled?: boolean;
}

export function OtpDigitInput({ digits, onChange, hasError = false, disabled = false }: OtpDigitInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (index: number) => {
    const el = refs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const digit = sanitizeDigit(event.target.value);
    const next = [...digits];
    next[index] = digit;
    onChange(next);

    const focusIndex = nextFocusIndexOnInput(index, digit);
    if (focusIndex !== null) focusAt(focusIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      const hadValue = Boolean(digits[index]);
      const next = [...digits];
      next[hadValue ? index : Math.max(index - 1, 0)] = '';
      onChange(next);

      const focusIndex = nextFocusIndexOnBackspace(index, hadValue);
      if (focusIndex !== null) focusAt(focusIndex);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
      event.preventDefault();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = parseOtpPaste(event.clipboardData.getData('text'));
    if (!pasted.some(Boolean)) return;
    onChange(pasted);
    const lastFilledIndex = pasted.reduce((last, digit, index) => (digit ? index : last), 0);
    focusAt(Math.min(lastFilledIndex + 1, OTP_LENGTH - 1));
  };

  return (
    <div className="flex gap-2 sm:gap-3">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digits[index] ?? ''}
          onChange={(event) => handleChange(event, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={hasError || undefined}
          className={cn(
            // flex-1 + min-w-0 lets boxes shrink evenly to fit narrow screens instead of
            // overflowing; aspect-square keeps height in sync with the shrunk width.
            'aspect-square w-full min-w-0 max-w-12 flex-1 rounded-md border bg-transparent text-center',
            'text-base font-medium text-foreground sm:text-lg',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            hasError ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
          )}
        />
      ))}
    </div>
  );
}
