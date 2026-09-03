import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { StarRatingInput } from '../StarRating';

function RatingHarness() {
  const [rating, setRating] = useState(0);
  return <StarRatingInput value={rating} onChange={setRating} />;
}

describe('StarRatingInput', () => {
  it('lets a customer choose a rating from one to five', async () => {
    const user = userEvent.setup();
    render(<RatingHarness />);

    await user.click(screen.getByRole('radio', { name: '5 stars' }));

    expect(screen.getByRole('radio', { name: '5 stars' })).toHaveAttribute('aria-checked', 'true');
  });
});
