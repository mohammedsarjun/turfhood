import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { listMyBookings } from '../../actions/bookingApi';
import { listMyOpenSessions } from '../../../open-sessions/actions/openSessionApi';
import { MyBookingsPage } from '../MyBookingsPage';

jest.mock('../../actions/bookingApi');
jest.mock('../../../open-sessions/actions/openSessionApi');

describe('MyBookingsPage', () => {
  it('requests the next backend page and resets both lists when the status changes', async () => {
    jest.mocked(listMyBookings).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 10, total: 21, totalPages: 3 },
    });
    jest.mocked(listMyOpenSessions).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });
    render(<MyBookingsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    await waitFor(() => expect(listMyBookings).toHaveBeenLastCalledWith(2, 'upcoming'));
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));
    await waitFor(() => expect(listMyBookings).toHaveBeenLastCalledWith(1, 'completed'));
    expect(listMyOpenSessions).toHaveBeenLastCalledWith(1, 'completed');
    await screen.findByText('No completed bookings.');
  });
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

  it('labels a filled open-session booking and shows the participant share', async () => {
    jest.mocked(listMyBookings).mockResolvedValue({
      items: [
        {
          id: 'booking-1',
          reference: 'OS-SESSION1',
          userId: 'host-1',
          turfId: 'turf-1',
          courtId: 'court-1',
          bookingDate: '2026-10-10',
          slots: [{ startTime: '18:00', endTime: '19:00', pricePaise: 200000 }],
          turfName: 'City Turf',
          courtName: 'Court A',
          address: 'Kochi',
          customerName: 'Host',
          customerEmail: 'host@example.com',
          subtotalPaise: 200000,
          discountPaise: 0,
          taxPaise: 0,
          platformFeePaise: 0,
          commissionPercentage: 10,
          commissionPaise: 20000,
          ownerEarningsPaise: 180000,
          finalAmountPaise: 200000,
          currency: 'INR',
          status: 'confirmed',
          paymentStatus: 'paid',
          bookingType: 'open_session',
          openSessionId: 'session-1',
          participantUserIds: ['host-1', 'player-2'],
          customerSharePaise: 20000,
          timeline: [],
          cancellationPolicy: {
            graceMinutes: 0,
            fullRefundBeforeHours: 0,
            partialRefundBeforeHours: 0,
            partialRefundPercentage: 0,
          },
          createdAt: '2026-09-01T12:30:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    jest.mocked(listMyOpenSessions).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    render(<MyBookingsPage />);

    expect(await screen.findByText('Open session')).toBeInTheDocument();
    expect(screen.getByText('Your share')).toBeInTheDocument();
    expect(screen.getByText('Rs. 200.00')).toBeInTheDocument();
  });
});
