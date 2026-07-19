import userEvent from '@testing-library/user-event';
import { push, replace } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { adminLogin } from '../../actions/adminLoginApi';
import { AdminLoginForm } from '../AdminLoginForm';

jest.mock('../../actions/adminLoginApi');
const adminLoginMock = jest.mocked(adminLogin);

describe('AdminLoginForm', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    adminLoginMock.mockClear();
  });

  it('renders the heading and both expected fields', () => {
    render(<AdminLoginForm />);

    expect(screen.getByRole('heading', { name: /admin sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits the form with the values typed in and redirects on success', async () => {
    const user = userEvent.setup();
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

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'admin@turfhood.com');
    await user.type(screen.getByLabelText(/^password$/i), 'adminPassword1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(adminLoginMock).toHaveBeenCalledWith({
        email: 'admin@turfhood.com',
        password: 'adminPassword1',
      });
    });
    expect(replace).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('does not submit when the password is left empty', async () => {
    const user = userEvent.setup();

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText(/email address/i), 'admin@turfhood.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(adminLoginMock).not.toHaveBeenCalled();
  });
});
