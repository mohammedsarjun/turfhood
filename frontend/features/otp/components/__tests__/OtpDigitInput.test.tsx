import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@/test/test-utils';
import { OtpDigitInput } from '../OtpDigitInput';
import { OTP_LENGTH } from '../../lib/otpInput';

function ControlledOtpDigitInput({ hasError = false }: { hasError?: boolean }) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  return <OtpDigitInput digits={digits} onChange={setDigits} hasError={hasError} />;
}

function getBoxes() {
  return Array.from({ length: OTP_LENGTH }, (_, index) => screen.getByLabelText(`Digit ${index + 1}`));
}

describe('OtpDigitInput', () => {
  it('advances focus to the next box after typing a digit', async () => {
    const user = userEvent.setup();
    render(<ControlledOtpDigitInput />);
    const boxes = getBoxes();

    await user.type(boxes[0] as HTMLElement, '1');

    expect(boxes[1]).toHaveFocus();
  });

  it('moves focus back and clears the previous digit on backspace from an empty box', async () => {
    const user = userEvent.setup();
    render(<ControlledOtpDigitInput />);
    const boxes = getBoxes();

    await user.type(boxes[0] as HTMLElement, '1');
    expect(boxes[1]).toHaveFocus();

    await user.keyboard('{Backspace}');

    expect(boxes[0]).toHaveFocus();
    expect(boxes[0]).toHaveValue('');
  });

  it('distributes pasted digits across all boxes', () => {
    render(<ControlledOtpDigitInput />);
    const boxes = getBoxes();

    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(pasteEvent, 'clipboardData', { value: { getData: () => '123456' } });
    act(() => {
      (boxes[0] as HTMLElement).dispatchEvent(pasteEvent);
    });

    for (let i = 0; i < OTP_LENGTH; i++) {
      expect(boxes[i]).toHaveValue(String(i + 1));
    }
  });

  it('applies error styling when hasError is true', () => {
    render(<ControlledOtpDigitInput hasError />);
    const boxes = getBoxes();

    expect(boxes[0]).toHaveAttribute('aria-invalid', 'true');
  });
});
