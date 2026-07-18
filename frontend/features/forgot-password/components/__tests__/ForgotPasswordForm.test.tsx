import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';
import { requestPasswordReset } from '../../actions/forgotPasswordApi';
import { ForgotPasswordForm } from '../ForgotPasswordForm';

jest.mock('../../actions/forgotPasswordApi');
const requestPasswordResetMock = jest.mocked(requestPasswordReset);

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    requestPasswordResetMock.mockClear();
  });

  it('renders the heading and email field', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  // INTERACTION TEST (happy path): submits a valid email and checks the form
  // switches into its confirmation state once the request succeeds.
  it('submits the email and shows the confirmation state on success', async () => {
    const user = userEvent.setup();
    requestPasswordResetMock.mockResolvedValueOnce({
      message: 'If an account exists for this email, a password reset link has been sent.',
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'jordan@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith({ email: 'jordan@example.com' });
    });
    expect(await screen.findByRole('heading', { name: /check your email/i })).toBeInTheDocument();
  });

  // INTERACTION TEST (error case): an invalid email must block submission
  // client-side — requestPasswordReset() must never be called.
  it('does not submit for an invalid email address', async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(requestPasswordResetMock).not.toHaveBeenCalled();
  });
});
