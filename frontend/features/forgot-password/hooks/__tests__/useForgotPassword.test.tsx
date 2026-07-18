import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';
import { ApiError } from '@/types/api/response';
import { requestPasswordReset } from '../../actions/forgotPasswordApi';
import { useForgotPassword } from '../useForgotPassword';

jest.mock('../../actions/forgotPasswordApi');

const requestPasswordResetMock = jest.mocked(requestPasswordReset);

// Minimal harness rendering just enough of a form to drive useForgotPassword()
// without depending on ForgotPasswordForm's markup — this test targets the
// hook's branching logic, not the reference-standard component itself.
function ForgotPasswordHookHarness() {
  const { register, onSubmit, submitted, formError } = useForgotPassword();
  return (
    <form onSubmit={onSubmit}>
      <input aria-label="email" {...register('email')} />
      <button type="submit">Submit</button>
      {submitted && <p>submitted</p>}
      {formError && <p>{formError}</p>}
    </form>
  );
}

async function submitForgotPassword(email: string) {
  const user = userEvent.setup();
  render(<ForgotPasswordHookHarness />);
  await user.type(screen.getByLabelText('email'), email);
  await user.click(screen.getByRole('button', { name: /submit/i }));
}

describe('useForgotPassword', () => {
  beforeEach(() => {
    requestPasswordResetMock.mockClear();
  });

  it('calls requestPasswordReset and shows the submitted confirmation state on success', async () => {
    requestPasswordResetMock.mockResolvedValueOnce({
      message: 'If an account exists for this email, a password reset link has been sent.',
    });

    await submitForgotPassword('jordan@example.com');

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith({ email: 'jordan@example.com' });
    });
    expect(await screen.findByText('submitted')).toBeInTheDocument();
  });

  it('shows the API error message on failure', async () => {
    requestPasswordResetMock.mockRejectedValueOnce(new ApiError('Something went wrong.', 500));

    await submitForgotPassword('jordan@example.com');

    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
  });
});
