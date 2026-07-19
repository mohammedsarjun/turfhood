import userEvent from '@testing-library/user-event';
import { push, replace } from '@/__mocks__/next/navigation';
import { act, render, screen, waitFor } from '@/test/test-utils';
import { ApiError } from '@/types/api/response';
import { verifyOtp, resendOtp } from '../../actions/otpApi';
import { OtpErrorCode } from '../../types';
import { OtpForm } from '../OtpForm';

jest.mock('../../actions/otpApi');
const verifyOtpMock = jest.mocked(verifyOtp);
const resendOtpMock = jest.mocked(resendOtp);

const validVerifyResponse = {
  message: 'Email verified successfully.',
  isVerified: true as const,
  user: {
    id: 'user_1',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    roles: ['customer' as const],
    isVerified: true,
    status: 'active' as const,
    createdAt: new Date('2026-01-01').toISOString(),
  },
  accessToken: 'token_123',
};

async function typeCodeAndSubmit(code: string) {
  const user = userEvent.setup();
  for (let i = 0; i < code.length; i++) {
    await user.type(screen.getByLabelText(`Digit ${i + 1}`), code[i] as string);
  }
  await user.click(screen.getByRole('button', { name: /verify code/i }));
}

describe('OtpForm', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    verifyOtpMock.mockClear();
    resendOtpMock.mockClear();
  });

  it('submits the full code and redirects home on success', async () => {
    verifyOtpMock.mockResolvedValueOnce(validVerifyResponse);

    render(
      <OtpForm maskedEmail="jo•••••@example.com" purpose="login" expiresAt={Date.now() + 60_000} />,
    );
    await typeCodeAndSubmit('123456');

    await waitFor(() => {
      expect(verifyOtpMock).toHaveBeenCalledWith({ otp: '123456' });
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/');
    });
  });

  it('shows an expiry-specific message when the code has expired', async () => {
    verifyOtpMock.mockRejectedValueOnce(
      new ApiError('Verification code has expired.', 400, undefined, OtpErrorCode.OTP_EXPIRED),
    );

    render(
      <OtpForm maskedEmail="jo•••••@example.com" purpose="login" expiresAt={Date.now() + 60_000} />,
    );
    await typeCodeAndSubmit('123456');

    expect(await screen.findByText(/verification code has expired/i)).toBeInTheDocument();
  });

  it('shows an invalid-code message for a wrong code', async () => {
    verifyOtpMock.mockRejectedValueOnce(
      new ApiError('Invalid verification code.', 400, undefined, OtpErrorCode.OTP_INVALID),
    );

    render(
      <OtpForm maskedEmail="jo•••••@example.com" purpose="login" expiresAt={Date.now() + 60_000} />,
    );
    await typeCodeAndSubmit('000000');

    expect(await screen.findByText(/invalid verification code/i)).toBeInTheDocument();
  });

  describe('resend countdown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('hides the resend action during the countdown and shows it once expired', () => {
      render(
        <OtpForm maskedEmail="jo•••••@example.com" purpose="login" expiresAt={Date.now() + 60_000} />,
      );

      expect(screen.queryByRole('button', { name: /resend code/i })).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(61_000);
      });

      expect(screen.getByRole('button', { name: /resend code/i })).toBeInTheDocument();
    });

    it('calls resendOtp and resets the countdown when Resend Code is clicked', async () => {
      resendOtpMock.mockResolvedValueOnce({
        message: 'Verification code sent.',
        expiresInSeconds: 60,
      });
      render(
        <OtpForm maskedEmail="jo•••••@example.com" purpose="login" expiresAt={Date.now() + 60_000} />,
      );

      act(() => {
        jest.advanceTimersByTime(61_000);
      });
      const resendButton = screen.getByRole('button', { name: /resend code/i });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await user.click(resendButton);

      expect(resendOtpMock).toHaveBeenCalledWith();
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /resend code/i })).not.toBeInTheDocument();
      });
    });
  });
});
