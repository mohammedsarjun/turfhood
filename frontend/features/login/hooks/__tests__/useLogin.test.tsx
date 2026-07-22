import userEvent from '@testing-library/user-event';
import { push, replace } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { login } from '../../actions/loginApi';
import { sendOtp } from '../../../otp/actions/otpApi';
import { useLogin } from '../useLogin';

jest.mock('../../actions/loginApi');
jest.mock('../../../otp/actions/otpApi');

const loginMock = jest.mocked(login);
const sendOtpMock = jest.mocked(sendOtp);

// Minimal harness rendering just enough of a form to drive useLogin() without
// depending on LoginForm's markup — this test targets the hook's branching
// logic, not the reference-standard LoginForm component itself.
function LoginHookHarness() {
  const { register, onSubmit } = useLogin();
  return (
    <form onSubmit={onSubmit}>
      <input aria-label="email" {...register('email')} />
      <input aria-label="password" type="password" {...register('password')} />
      <button type="submit">Submit</button>
    </form>
  );
}

async function submitLogin(email: string, password: string) {
  const user = userEvent.setup();
  render(<LoginHookHarness />);
  await user.type(screen.getByLabelText('email'), email);
  await user.type(screen.getByLabelText('password'), password);
  await user.click(screen.getByRole('button', { name: /submit/i }));
}

describe('useLogin', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    loginMock.mockClear();
    sendOtpMock.mockClear();
  });

  it('sends an OTP and redirects to /otp when the response is needs_verification', async () => {
    loginMock.mockResolvedValueOnce({
      status: 'needs_verification',
      email: 'jordan@example.com',
      message: 'Please verify your email to continue.',
    });
    sendOtpMock.mockResolvedValueOnce({ message: 'Verification code sent.', expiresInSeconds: 60 });

    await submitLogin('jordan@example.com', 'password1');

    await waitFor(() => {
      expect(sendOtpMock).toHaveBeenCalledWith({ email: 'jordan@example.com', purpose: 'login' });
    });
    expect(push).toHaveBeenCalledWith('/otp');
  });

  it('redirects home on a successful login', async () => {
    loginMock.mockResolvedValueOnce({
      status: 'success',
      user: {
        id: 'user_1',
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        roles: ['customer'],
        isVerified: true,
        status: 'active',
        createdAt: new Date('2026-01-01').toISOString(),
      },
      accessToken: 'token_123',
      refreshToken: 'refresh_token_123',
    });

    await submitLogin('jordan@example.com', 'password1');

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/');
    });
    expect(sendOtpMock).not.toHaveBeenCalled();
  });
});
