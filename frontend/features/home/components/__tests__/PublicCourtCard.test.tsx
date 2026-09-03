import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { PublicCourtCard } from '../PublicCourtCard';

describe('PublicCourtCard', () => {
  it('switches court images and shows per-slot pricing', async () => {
    const user = userEvent.setup();
    render(
      <PublicCourtCard
        court={{
          id: 'court-1',
          name: 'Court One',
          images: ['one.webp', 'two.webp'],
          sports: ['Football'],
          capacity: 10,
          slotDurationMinutes: 60,
          startingPricePerSlot: 400,
        }}
      />,
    );
    expect(screen.getByText(/₹400/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next court image/i }));
    expect(screen.getByRole('img', { name: 'Court One' })).toHaveAttribute('src', 'two.webp');
  });
});
