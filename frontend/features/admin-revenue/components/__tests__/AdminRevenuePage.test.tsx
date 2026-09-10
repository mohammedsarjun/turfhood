import { render, screen } from '@/test/test-utils';
import { getAdminRevenue } from '../../actions/adminRevenueApi';
import { AdminRevenuePage } from '../AdminRevenuePage';

jest.mock('../../actions/adminRevenueApi');

describe('AdminRevenuePage', () => {
  it('shows commission totals and booking transactions', async () => {
    jest.mocked(getAdminRevenue).mockResolvedValue({
      range: { startDate: '2026-09-01', endDate: '2026-09-09' },
      summary: {
        bookings: 1,
        grossRevenuePaise: 200000,
        commissionPaise: 20000,
        ownerPayoutPaise: 180000,
        averageCommissionPercentage: 10,
      },
      snapshots: {
        todayCommissionPaise: 20000,
        monthCommissionPaise: 40000,
        yearCommissionPaise: 90000,
      },
      bookingTypes: { private: 1, openSession: 0 },
      trend: [
        {
          date: '2026-09-09',
          bookings: 1,
          grossRevenuePaise: 200000,
          commissionPaise: 20000,
          ownerPayoutPaise: 180000,
          averageCommissionPercentage: 10,
        },
      ],
      transactions: [
        {
          id: 'booking-1',
          reference: 'TH-100',
          bookingDate: '2026-09-09',
          turfName: 'City Turf',
          customerName: 'Asha',
          bookingType: 'private',
          grossRevenuePaise: 200000,
          commissionPaise: 20000,
          ownerPayoutPaise: 180000,
          commissionPercentage: 10,
        },
      ],
    });

    render(<AdminRevenuePage />);

    expect(await screen.findByText('Platform Revenue')).toBeInTheDocument();
    expect(screen.getByText('TH-100')).toBeInTheDocument();
    expect(screen.getAllByText('₹200.00').length).toBeGreaterThan(0);
    expect(screen.getByText('City Turf')).toBeInTheDocument();
  });
});
