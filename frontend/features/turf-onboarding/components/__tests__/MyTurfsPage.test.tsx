import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { TurfApplicationStatus } from '@turfhood/shared';
import { listMyApplications } from '../../actions/turfOnboardingApi';
import { listPublicAmenities, listPublicSportsTypes } from '../../actions/catalogApi';
import { MyTurfsPage } from '../MyTurfsPage';

jest.mock('../../actions/turfOnboardingApi');
jest.mock('../../actions/catalogApi');

const listMyApplicationsMock = jest.mocked(listMyApplications);
const listPublicSportsTypesMock = jest.mocked(listPublicSportsTypes);
const listPublicAmenitiesMock = jest.mocked(listPublicAmenities);

describe('MyTurfsPage', () => {
  it('requests another page from the backend', async () => {
    listMyApplicationsMock.mockResolvedValue({
      applications: [],
      pagination: { page: 1, limit: 9, total: 10, totalPages: 2 },
    });
    render(<MyTurfsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    await waitFor(() => expect(listMyApplicationsMock).toHaveBeenLastCalledWith(2));
    await screen.findByText('Page 2 of 2');
  });
  beforeEach(() => {
    listMyApplicationsMock.mockReset();
    listPublicSportsTypesMock.mockReset();
    listPublicAmenitiesMock.mockReset();
    listPublicSportsTypesMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });
    listPublicAmenitiesMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });
  });

  it('shows an empty-state message when there are no applications', async () => {
    listMyApplicationsMock.mockResolvedValueOnce({
      applications: [],
      pagination: { page: 1, limit: 9, total: 0, totalPages: 1 },
    });

    render(<MyTurfsPage />);

    await waitFor(() => {
      expect(screen.getByText(/haven't submitted any turfs yet/i)).toBeInTheDocument();
    });
  });

  it('renders a card per application and an Add Turf link', async () => {
    listMyApplicationsMock.mockResolvedValueOnce({
      pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
      applications: [
        {
          id: 'application_1',
          name: 'Green Turf Arena',
          address: {
            line1: '1 Main St',
            city: 'Chennai',
            cityCode: '1',
            state: 'Tamil Nadu',
            stateCode: 'TN',
            country: 'India',
            countryCode: 'IN',
            pincode: '600002',
          },
          location: { type: 'Point', coordinates: [80.27, 13.08] },
          sportsOffered: [],
          amenities: [],
          documents: [],
          images: [],
          status: TurfApplicationStatus.APPROVED,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<MyTurfsPage />);

    await waitFor(() => {
      expect(screen.getByText('Green Turf Arena')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /add turf/i })).toHaveAttribute(
      'href',
      '/become-a-turf-owner/apply',
    );
    expect(screen.getByRole('link', { name: /view dashboard/i })).toHaveAttribute(
      'href',
      '/turf-portal/application_1/dashboard',
    );
  });
});
