import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { NearbyTurfs } from '../NearbyTurfs';

describe('NearbyTurfs', () => {
  it('shows guidance before a location is selected', () => {
    render(<NearbyTurfs location={null} turfs={[]} loading={false} />);
    expect(screen.getByText('Select your state and city')).toBeInTheDocument();
    expect(screen.getByText(/nearby turfs will appear here/i)).toBeInTheDocument();
  });

  it('shows a city-specific empty state', () => {
    render(
      <NearbyTurfs
        location={{
          state: { name: 'Tamil Nadu', code: 'TN' },
          city: { name: 'Coimbatore', code: '3659' },
        }}
        turfs={[]}
        loading={false}
      />,
    );
    expect(screen.getByText(/no approved turfs found in coimbatore/i)).toBeInTheDocument();
  });

  it('shows court sports, hourly price, images, and favorite control', async () => {
    const user = userEvent.setup();
    render(
      <NearbyTurfs
        location={{
          state: { name: 'Tamil Nadu', code: 'TN' },
          city: { name: 'Coimbatore', code: '3659' },
        }}
        loading={false}
        turfs={[
          {
            id: 'turf-1',
            name: 'Turf Arena',
            city: 'Coimbatore',
            cityCode: '3659',
            imageUrls: ['one.webp', 'two.webp'],
            rating: 4.5,
            ratingCount: 3,
            sports: ['Football', 'Cricket', 'Badminton', 'Tennis', 'Volleyball', 'Basketball'],
            startingPricePerSlot: 400,
          },
        ]}
      />,
    );
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
    expect(screen.getByText('₹400')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /add turf arena to favorites/i }));
    expect(
      screen.getByRole('button', { name: /remove turf arena from favorites/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /next turf image/i }));
    expect(screen.getByRole('img', { name: 'Turf Arena' })).toHaveAttribute('src', 'two.webp');
  });

  it('hides the rating when there are no reviews', () => {
    render(
      <NearbyTurfs
        location={{
          state: { name: 'Tamil Nadu', code: 'TN' },
          city: { name: 'Coimbatore', code: '3659' },
        }}
        loading={false}
        turfs={[
          {
            id: 'turf-2',
            name: 'New Turf',
            city: 'Coimbatore',
            cityCode: '3659',
            imageUrls: [],
            rating: 0,
            ratingCount: 0,
            sports: [],
          },
        ]}
      />,
    );
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
    expect(screen.getByText('Pricing unavailable')).toBeInTheDocument();
  });
});
