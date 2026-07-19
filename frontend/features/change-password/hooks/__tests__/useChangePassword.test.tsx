import userEvent from '@testing-library/user-event';
import { push } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { ApiError } from '@/types/api/response';
import { changePassword } from '../../actions/changePasswordApi';
import { PasswordResetErrorCode } from '../../types';
import { useChangePassword } from '../useChangePassword';

jest.mock('../../actions/changePasswordApi');

const changePasswordMock = jest.mocked(changePassword);

// Minimal harness rendering just enough of a form to drive useChangePassword()
// without depending on ChangePasswordForm's markup — this test targets the
// hook's branching logic, not the reference-standard component itself.
function ChangePasswordHookHarness() {
  const { register, onSubmit, formError, tokenError } = useChangePassword('raw-token');
  return (
    <form onSubmit={onSubmit}>
      <input aria-label="newPassword" {...register('newPassword')} />
      <input aria-label="confirmPassword" {...register('confirmPassword')} />
      <button type="submit">Submit</button>
      {formError && <p>{formError}</p>}
      {tokenError && <p>{tokenError}</p>}
    </form>
  );
}

async function submitChangePassword(newPassword: string, confirmPassword: string) {
  const user = userEvent.setup();
  render(<ChangePasswordHookHarness />);
  await user.type(screen.getByLabelText('newPassword'), newPassword);
  await user.type(screen.getByLabelText('confirmPassword'), confirmPassword);
  await user.click(screen.getByRole('button', { name: /submit/i }));
}

describe('useChangePassword', () => {
  beforeEach(() => {
    push.mockClear();
    changePasswordMock.mockClear();
  });

  it('calls changePassword with the token and redirects to /login on success', async () => {
    changePasswordMock.mockResolvedValueOnce({ message: 'Password has been reset successfully.' });

    await submitChangePassword('newPassword1', 'newPassword1');

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith({
        token: 'raw-token',
        newPassword: 'newPassword1',
      });
    });
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('sets a distinct tokenError (not formError) for a RESET_TOKEN_EXPIRED response', async () => {
    changePasswordMock.mockRejectedValueOnce(
      new ApiError(
        'This password reset link has expired.',
        400,
        undefined,
        PasswordResetErrorCode.RESET_TOKEN_EXPIRED,
      ),
    );

    await submitChangePassword('newPassword1', 'newPassword1');

    expect(await screen.findByText(PasswordResetErrorCode.RESET_TOKEN_EXPIRED)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('sets formError (not tokenError) for a generic failure', async () => {
    changePasswordMock.mockRejectedValueOnce(new ApiError('Something went wrong.', 500));

    await submitChangePassword('newPassword1', 'newPassword1');

    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
