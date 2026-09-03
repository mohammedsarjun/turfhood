import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { listCities, listStates } from '../../../turf-onboarding/actions/locationApi';
import {
  listPublicAmenities,
  listPublicSportsTypes,
} from '../../../turf-onboarding/actions/catalogApi';
import { TurfFilters } from '../TurfFilters';

jest.mock('../../../turf-onboarding/actions/locationApi');
jest.mock('../../../turf-onboarding/actions/catalogApi');

describe('TurfFilters', () => {
  beforeEach(() => {
    jest.mocked(listStates).mockResolvedValue({ items: [] });
    jest.mocked(listCities).mockResolvedValue({ items: [] });
    jest.mocked(listPublicAmenities).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 1 },
    });
    jest.mocked(listPublicSportsTypes).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 1 },
    });
  });

  it('keeps Near Me off when browser location permission is denied', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error({} as GeolocationPositionError),
      },
    });
    const user = userEvent.setup();
    render(<TurfFilters open onClose={jest.fn()} onApply={jest.fn()} />);
    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('alert')).toHaveTextContent(/allow location access/i);
  });
});
