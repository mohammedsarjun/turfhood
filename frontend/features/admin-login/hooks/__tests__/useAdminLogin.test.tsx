import userEvent from '@testing-library/user-event';
import { push, replace } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { ApiError } from '@/types/api/response';
import { adminLogin } from '../../actions/adminLoginApi';
import { useAdminLogin } from '../useAdminLogin';

jest.mock('../../actions/adminLoginApi');

const adminLoginMock = jest.mocked(adminLogin);

// Minimal harness rendering just enough of a form to drive useAdminLogin() without
// depending on AdminLoginForm's markup — this test targets the hook's branching logic.
function AdminLoginHookHarness() {
  const { register, onSubmit, formError } = useAdminLogin();
  return (
    <form onSubmit={onSubmit}>
      <input aria-label="email" {...register('email')} />
      <input aria-label="password" type="password" {...register('password')} />
      <button type="submit">Submit</button>
      {formError && <p role="alert">{formError}</p>}
    </form>
  );
}

async function submitAdminLogin(email: string, password: string) {
  const user = userEvent.setup();
  render(<AdminLoginHookHarness />);
  await user.type(screen.getByLabelText('email'), email);
  await user.type(screen.getByLabelText('password'), password);
  await user.click(screen.getByRole('button', { name: /submit/i }));
}

describe('useAdminLogin', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    adminLoginMock.mockClear();
  });

  it('redirects to /admin/dashboard on a successful login', async () => {
    adminLoginMock.mockResolvedValueOnce({
      admin: {
        id: 'admin_1',
        name: 'Admin',
        email: 'admin@turfhood.com',
        roles: ['admin'],
        isVerified: true,
        status: 'active',
        createdAt: new Date('2026-01-01').toISOString(),
        hasPassword: true,
        authProviders: ['email'],
      },
      accessToken: 'admin_token_123',
    });

    await submitAdminLogin('admin@turfhood.com', 'adminPassword1');

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('shows an error and does not redirect on invalid admin credentials', async () => {
    adminLoginMock.mockRejectedValueOnce(new ApiError('Invalid admin email or password.', 401));

    await submitAdminLogin('admin@turfhood.com', 'wrong-password');

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid admin email or password/i);
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
