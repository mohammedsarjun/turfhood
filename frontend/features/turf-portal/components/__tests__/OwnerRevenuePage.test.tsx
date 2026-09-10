import { render, screen } from '@/test/test-utils';
import { OwnerRevenuePage } from '../OwnerRevenuePage';

jest.mock('../../hooks/useOwnerRevenue', () => ({
  useOwnerRevenue: () => ({
    loading: false,
    error: undefined,
    retry: jest.fn(),
    report: {
      turfName: 'Green Arena',
      bookingStatus: { booked: 2, cancelled: 1, completed: 3 },
      selectedRange: {
        startDate: '2026-09-01',
        endDate: '2026-09-09',
        summary: {
          bookings: 3,
          grossRevenuePaise: 300000,
          commissionPaise: 30000,
          netEarningsPaise: 270000,
        },
      },
      snapshots: {
        today: {
          bookings: 1,
          grossRevenuePaise: 100000,
          commissionPaise: 10000,
          netEarningsPaise: 90000,
        },
        last7Days: {
          bookings: 3,
          grossRevenuePaise: 300000,
          commissionPaise: 30000,
          netEarningsPaise: 270000,
        },
        thisMonth: {
          bookings: 3,
          grossRevenuePaise: 300000,
          commissionPaise: 30000,
          netEarningsPaise: 270000,
        },
      },
      trend: [],
      transactions: [],
    },
  }),
}));

describe('OwnerRevenuePage', () => {
  it('shows period controls and booking status data', () => {
    render(<OwnerRevenuePage turfId="turf-1" />);
    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'This year' })).toBeInTheDocument();
    expect(screen.getByText('Booking status')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});
