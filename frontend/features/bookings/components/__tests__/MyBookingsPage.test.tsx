import { render, screen } from '@/test/test-utils';
import { listMyBookings } from '../../actions/bookingApi';
import { listMyOpenSessions } from '../../../open-sessions/actions/openSessionApi';
import { MyBookingsPage } from '../MyBookingsPage';

jest.mock('../../actions/bookingApi');
jest.mock('../../../open-sessions/actions/openSessionApi');

describe('MyBookingsPage', () => {
  it('shows an open session joined by the current user', async () => {
    jest.mocked(listMyBookings).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });
    jest.mocked(listMyOpenSessions).mockResolvedValue({
      items: [
        {
          id: 'session-1',
          creatorId: 'host-1',
          turfId: 'turf-1',
          courtId: 'court-1',
          turfName: 'City Turf',
          courtName: 'Court A',
          address: 'Kochi',
          location: { latitude: 10, longitude: 76 },
          sportTypeId: 'sport-1',
          sportName: 'Football',
          bookingDate: '2026-10-10',
          startTime: '18:00',
          endTime: '19:00',
          minimumPlayers: 6,
          maximumPlayers: 10,
          joinedPlayers: 2,
          totalPricePaise: 200000,
          pricePerParticipantPaise: 20000,
          status: 'open',
          fillDeadline: '2026-10-08T12:30:00.000Z',
          participants: [],
          createdAt: '2026-09-01T12:30:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    render(<MyBookingsPage />);

    expect(await screen.findByText('City Turf - Court A')).toBeInTheDocument();
    expect(screen.getByText('Open sessions')).toBeInTheDocument();
    expect(screen.queryByText('No upcoming bookings.')).not.toBeInTheDocument();
  });
});
