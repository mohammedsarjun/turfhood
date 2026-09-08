import { render, screen } from '@/test/test-utils';
import { SessionParticipants } from '../SessionParticipants';

describe('SessionParticipants', () => {
  it('highlights the signed-in participant and identifies the host', () => {
    render(
      <SessionParticipants
        currentUserId="user-2"
        maximumPlayers={6}
        participants={[
          {
            userId: 'user-1',
            name: 'Asha',
            isCreator: true,
            paymentStatus: 'paid',
            joinedAt: '2026-09-01T10:00:00.000Z',
          },
          {
            userId: 'user-2',
            name: 'Ravi',
            isCreator: false,
            paymentStatus: 'paid',
            joinedAt: '2026-09-01T11:00:00.000Z',
          },
          {
            userId: 'user-3',
            name: 'Pending player',
            isCreator: false,
            paymentStatus: 'pending',
            joinedAt: '2026-09-01T12:00:00.000Z',
          },
        ]}
      />,
    );
    expect(screen.getByText('Asha')).toBeInTheDocument();
    expect(screen.getByText('Session host')).toBeInTheDocument();
    expect(screen.getByText('Ravi').closest('div[class*="border-primary"]')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.queryByText('Pending player')).not.toBeInTheDocument();
  });
});
