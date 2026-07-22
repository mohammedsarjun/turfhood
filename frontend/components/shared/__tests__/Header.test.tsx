import userEvent from '@testing-library/user-event';
import { push, refresh } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { logout } from '../../../lib/auth/logoutApi';
import { useMyApplication } from '../../../features/turf-onboarding/hooks/useMyApplication';
import { TurfApplicationStatus } from '@turfhood/shared';
import { Header } from '../Header';

jest.mock('../../../lib/auth/logoutApi');
jest.mock('../../../features/turf-onboarding/hooks/useMyApplication');
const logoutMock = jest.mocked(logout);
const useMyApplicationMock = jest.mocked(useMyApplication);

describe('Header', () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    logoutMock.mockClear();
    useMyApplicationMock.mockReturnValue({ application: null, isLoading: false, error: null });
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

  it('shows "Become a Turf Owner" when the user has no application', async () => {
    const user = userEvent.setup();
    render(<Header userName="Jordan Lee" />);

    await user.click(screen.getByLabelText(/account menu/i));

    expect(screen.getByRole('menuitem', { name: /become a turf owner/i })).toHaveAttribute(
      'href',
      '/become-a-turf-owner',
    );
  });

  it('shows "My Turfs" once the user has submitted an application', async () => {
    useMyApplicationMock.mockReturnValue({
      application: {
        id: 'app-1',
        name: 'Green Field',
        status: TurfApplicationStatus.PENDING,
        address: {
          line1: '1 Main St',
          city: 'Kochi',
          cityCode: '1',
          state: 'Kerala',
          stateCode: 'KL',
          country: 'India',
          countryCode: 'IN',
          pincode: '682001',
        },
        location: { type: 'Point', coordinates: [0, 0] },
        sportsOffered: [],
        amenities: [],
        documents: [],
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
    });
    const user = userEvent.setup();
    render(<Header userName="Jordan Lee" />);

    await user.click(screen.getByLabelText(/account menu/i));

    expect(screen.getByRole('menuitem', { name: /my turfs/i })).toHaveAttribute(
      'href',
      '/my-turfs',
    );
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
