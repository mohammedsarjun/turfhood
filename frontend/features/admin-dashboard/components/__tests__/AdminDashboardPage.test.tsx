import { render, screen } from '@/test/test-utils';
import { getAdminDashboard } from '../../actions/adminDashboardApi';
import { AdminDashboardPage } from '../AdminDashboardPage';

jest.mock('../../actions/adminDashboardApi');

describe('AdminDashboardPage', () => {
  it('shows platform metrics and operational alerts', async () => {
    jest.mocked(getAdminDashboard).mockResolvedValue({
      totalCustomers: 120,
      totalOwners: 8,
      approvedTurfs: 14,
      totalBookings: 72,
      grossRevenuePaise: 4500000,
      platformCommissionPaise: 450000,
      pendingApplications: 3,
      escalatedRefunds: 1,
      activeOpenSessions: 6,
      confirmedBookings: 10,
      completedBookings: 50,
      cancelledBookings: 12,
      trends: [{ month: '2026-09', label: "Sep '26", bookings: 12, revenuePaise: 800000 }],
      recentBookings: [],
    });

    render(<AdminDashboardPage />);

    expect(await screen.findByText('Good to see you, Admin')).toBeInTheDocument();
    expect(screen.getByText('₹45,000')).toBeInTheDocument();
    expect(screen.getByText('Pending turf applications')).toBeInTheDocument();
    expect(screen.getByText('Escalated refunds')).toBeInTheDocument();
  });
});
