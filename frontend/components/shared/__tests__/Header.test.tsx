import userEvent from '@testing-library/user-event';
import { push, refresh } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { logout } from '../../../lib/auth/logoutApi';
import { Header } from '../Header';

jest.mock('../../../lib/auth/logoutApi');
const logoutMock = jest.mocked(logout);

describe('Header', () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    logoutMock.mockClear();
  });

  it('renders the logo and does not show the account dropdown until opened', () => {
    render(<Header userName="Jordan Lee" />);

    expect(screen.getByLabelText(/turfhood home/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows an anonymous placeholder icon, not an image, when there is no avatarUrl', () => {
    render(<Header userName="Jordan Lee" />);

    const accountMenu = screen.getByLabelText(/account menu/i);
    expect(accountMenu.querySelector('img')).not.toBeInTheDocument();
    expect(accountMenu.querySelector('svg')).toBeInTheDocument();
  });

  it('shows the avatar image when avatarUrl is set', () => {
    render(<Header userName="Jordan Lee" avatarUrl="https://cdn.test/avatar.png" />);

    const accountMenu = screen.getByLabelText(/account menu/i);
    expect(accountMenu.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/avatar.png');
  });

  it('opens the dropdown on click and shows Profile and Logout', async () => {
    const user = userEvent.setup();
    render(<Header userName="Jordan Lee" />);

    await user.click(screen.getByLabelText(/account menu/i));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /profile/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
  });

  it('closes the dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Header userName="Jordan Lee" />
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByLabelText(/account menu/i));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('logs out and redirects to /login when Logout is clicked', async () => {
    const user = userEvent.setup();
    logoutMock.mockResolvedValueOnce(undefined);
    render(<Header userName="Jordan Lee" />);

    await user.click(screen.getByLabelText(/account menu/i));
    await user.click(screen.getByRole('menuitem', { name: /logout/i }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
    });
    expect(push).toHaveBeenCalledWith('/login');
  });
});
