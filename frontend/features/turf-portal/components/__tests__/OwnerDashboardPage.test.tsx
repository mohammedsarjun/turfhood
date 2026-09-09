import { render, screen } from '@/test/test-utils';
import { OwnerDashboardPage } from '../OwnerDashboardPage';

jest.mock('../../hooks/useOwnerDashboard', () => ({
  useOwnerDashboard: () => ({
    isLoading: false,
    error: null,
    retry: jest.fn(),
    dashboard: {
      turfName: 'Green Arena',
      stats: { totalBookings: 24, totalRevenuePaise: 125000, availableBalancePaise: 80000, averageRating: 4.5, reviewCount: 8 },
      today: { bookings: 3, revenuePaise: 15000 },
      courts: { total: 3, active: 2, attentionNeeded: 1 },
      upcomingBookings: [],
      recentReviews: [],
    },
  }),
}));

describe('OwnerDashboardPage', () => {
  it('shows the key business metrics and operational summaries', () => {
    render(<OwnerDashboardPage turfId="turf-1" />);
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('Total revenue')).toBeInTheDocument();
    expect(screen.getByText('Available balance')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText("Today's schedule")).toBeInTheDocument();
    expect(screen.getByText('Court health')).toBeInTheDocument();
  });
});
