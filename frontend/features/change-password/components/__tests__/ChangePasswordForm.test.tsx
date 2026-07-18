import userEvent from '@testing-library/user-event';
import { push } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { ApiError } from '@/types/api/response';
import { changePassword } from '../../actions/changePasswordApi';
import { PasswordResetErrorCode } from '../../types';
import { ChangePasswordForm } from '../ChangePasswordForm';

jest.mock('../../actions/changePasswordApi');
const changePasswordMock = jest.mocked(changePassword);

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    push.mockClear();
    changePasswordMock.mockClear();
  });

  it('renders the heading and both password fields', () => {
    render(<ChangePasswordForm token="raw-token" />);

    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  // INTERACTION TEST (happy path): matching, valid passwords submit successfully
  // and redirect to /login.
  it('submits matching valid passwords and redirects to /login', async () => {
    const user = userEvent.setup();
    changePasswordMock.mockResolvedValueOnce({ message: 'Password has been reset successfully.' });

    render(<ChangePasswordForm token="raw-token" />);

    await user.type(screen.getByLabelText(/^new password$/i), 'newPassword1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'newPassword1');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith({ token: 'raw-token', newPassword: 'newPassword1' });
    });
    expect(push).toHaveBeenCalledWith('/login');
  });

  // INTERACTION TEST (error case): mismatched confirm password must block
  // submission client-side.
  it('shows a mismatch error and does not submit when passwords differ', async () => {
    const user = userEvent.setup();

    render(<ChangePasswordForm token="raw-token" />);

    await user.type(screen.getByLabelText(/^new password$/i), 'newPassword1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'differentPassword1');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  // BRANCH UNDER TEST: an invalid/expired/used token must render a distinct
  // state (not the generic formError banner), with no way to resubmit the form.
  it('renders a distinct invalid-link state instead of the form when the token is bad', async () => {
    const user = userEvent.setup();
    changePasswordMock.mockRejectedValueOnce(
      new ApiError(
        'This password reset link has expired.',
        400,
        undefined,
        PasswordResetErrorCode.RESET_TOKEN_EXPIRED,
      ),
    );

    render(<ChangePasswordForm token="raw-token" />);

    await user.type(screen.getByLabelText(/^new password$/i), 'newPassword1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'newPassword1');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(await screen.findByRole('heading', { name: /link no longer valid/i })).toBeInTheDocument();
    expect(screen.getByText(/this password reset link has expired/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /change password/i })).not.toBeInTheDocument();
  });
});
