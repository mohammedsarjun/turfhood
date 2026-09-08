import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { listPublicSportsTypes } from '../../../turf-onboarding/actions/catalogApi';
import { OpenSessionFilters } from '../OpenSessionFilters';

jest.mock('../../../turf-onboarding/actions/catalogApi');

describe('OpenSessionFilters', () => {
  beforeEach(() => {
    jest.mocked(listPublicSportsTypes).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 1 },
    });
  });

  it('keeps Near Me off when location permission is denied', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error({} as GeolocationPositionError),
      },
    });
    const user = userEvent.setup();
    render(<OpenSessionFilters open onClose={jest.fn()} onApply={jest.fn()} />);
    const toggle = screen.getByRole('switch', { name: 'Near Me' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('alert')).toHaveTextContent(/allow location access/i);
  });

  it('applies coordinates when enabled and removes them when disabled', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 10.1, longitude: 76.2, accuracy: 20 },
          } as GeolocationPosition),
      },
    });
    const onApply = jest.fn();
    const user = userEvent.setup();
    render(<OpenSessionFilters open onClose={jest.fn()} onApply={onApply} />);
    const toggle = screen.getByRole('switch', { name: 'Near Me' });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(onApply).toHaveBeenLastCalledWith({ latitude: 10.1, longitude: 76.2 });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(onApply).toHaveBeenLastCalledWith({});
  });
});
