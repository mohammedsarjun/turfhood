import { render, screen } from '@/test/test-utils';
import { OpenSessionCard } from '../OpenSessionCard';

describe('OpenSessionCard', () => {
  it('shows player availability and the per-head price', () => {
    render(
      <OpenSessionCard
        session={{
          id: 'session-1', creatorId: 'user-1', turfId: 'turf-1', courtId: 'court-1',
          turfName: 'City Turf', courtName: 'Court A', address: 'Kochi',
          location: { latitude: 10, longitude: 76 }, sportTypeId: 'sport-1', sportName: 'Football',
          bookingDate: '2026-10-10', startTime: '18:00', endTime: '19:00', minimumPlayers: 6,
          maximumPlayers: 10, joinedPlayers: 4, totalPricePaise: 200000,
          pricePerParticipantPaise: 20000, status: 'open', fillDeadline: '2026-10-08T12:30:00.000Z',
          participants: [], createdAt: '2026-09-01T12:30:00.000Z',
        }}
      />,
    );
    expect(screen.getByText('Football')).toBeInTheDocument();
    expect(screen.getByText(/4 joined/)).toHaveTextContent('6 spots left');
    expect(screen.getByText(/₹200.00/)).toBeInTheDocument();
  });
});
