import { render, screen, waitFor } from '@/test/test-utils';
import { replace } from '@/__mocks__/next/navigation';
import { TurfApplicationStatus } from '@turfhood/shared';
import { getMyApplication } from '../../actions/turfOnboardingApi';
import { BecomeATurfOwnerContent } from '../BecomeATurfOwnerContent';

jest.mock('../../actions/turfOnboardingApi');
const getMyApplicationMock = jest.mocked(getMyApplication);

describe('BecomeATurfOwnerContent', () => {
  beforeEach(() => {
    getMyApplicationMock.mockReset();
    replace.mockClear();
  });

  it('shows the info/benefits page when the user has never applied', async () => {
    getMyApplicationMock.mockResolvedValueOnce({ application: null });

    render(<BecomeATurfOwnerContent />);

    await waitFor(() => {
      expect(screen.getByText(/why list with turfhood/i)).toBeInTheDocument();
    });
  });

  it('redirects to /my-turfs instead of showing the info page when an application already exists', async () => {
    getMyApplicationMock.mockResolvedValueOnce({
      application: {
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
        status: TurfApplicationStatus.PENDING,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    render(<BecomeATurfOwnerContent />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/my-turfs');
    });
    expect(screen.queryByText(/why list with turfhood/i)).not.toBeInTheDocument();
  });
});
