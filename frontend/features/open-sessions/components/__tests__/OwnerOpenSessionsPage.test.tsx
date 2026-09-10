import { fireEvent, render, screen } from '@/test/test-utils';
import { OwnerOpenSessionsPage } from '../OwnerOpenSessionsPage';

jest.mock('../../hooks/useOwnerOpenSessions', () => ({
  useOwnerOpenSessions: () => ({
    loading: false,
    error: undefined,
    data: {
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      items: [
        {
          id: 'session-1',
          creatorId: 'user-1',
          turfId: 'turf-1',
          courtId: 'court-1',
          turfName: 'Green Arena',
          courtName: 'Court A',
          address: 'Kochi',
          location: { latitude: 1, longitude: 1 },
          sportTypeId: 'sport-1',
          sportName: 'Football',
          bookingDate: '2026-10-10',
          startTime: '18:00',
          endTime: '19:00',
          minimumPlayers: 4,
          maximumPlayers: 6,
          joinedPlayers: 2,
          totalPricePaise: 120000,
          pricePerParticipantPaise: 20000,
          status: 'open',
          fillDeadline: '2026-10-09T00:00:00.000Z',
          createdAt: '2026-10-01T00:00:00.000Z',
          participants: [
            {
              userId: 'user-1',
              name: 'Arun',
              isCreator: true,
              paymentStatus: 'paid',
              joinedAt: '2026-10-01T00:00:00.000Z',
            },
            {
              userId: 'user-2',
              name: 'Maya',
              isCreator: false,
              paymentStatus: 'paid',
              joinedAt: '2026-10-01T01:00:00.000Z',
            },
          ],
        },
      ],
    },
  }),
}));

describe('OwnerOpenSessionsPage', () => {
  it('reveals paid participants for a turf session', () => {
    render(<OwnerOpenSessionsPage turfId="turf-1" />);
    expect(screen.getByText('2/6 joined')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View players' }));
    expect(screen.getByText('Arun')).toBeInTheDocument();
    expect(screen.getByText('Maya')).toBeInTheDocument();
    expect(screen.getByText('Session host')).toBeInTheDocument();
  });
});
