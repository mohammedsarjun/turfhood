import { injectable } from 'tsyringe';
import type { AdminDashboardDTO } from '@turfhood/shared';
import type { IAdminDashboardRepository } from '@domain/admin/repositories/IAdminDashboardRepository';
import { UserModel } from '@infrastructure/user/models/UserModel';
import { TurfModel } from '@infrastructure/turf/models/TurfModel';
import { BookingModel } from '@infrastructure/booking/models/BookingModel';
import { OpenSessionModel } from '@infrastructure/openSession/models/OpenSessionModel';
import { TurfOwnerApplicationModel } from '@infrastructure/turfOwnerApplication/models/TurfOwnerApplicationModel';

const monthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

@injectable()
export class AdminDashboardRepository implements IAdminDashboardRepository {
  async getRevenue(startDate: string, endDate: string, now: Date) {
    const status = { $in: ['confirmed', 'completed'] };
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const monthStart = `${today.slice(0, 7)}-01`;
    const yearStart = `${today.slice(0, 4)}-01-01`;
    const [items, snapshots] = await Promise.all([
      BookingModel.find({ bookingDate: { $gte: startDate, $lte: endDate }, status }).sort({
        bookingDate: -1,
        createdAt: -1,
        _id: -1,
      }),
      BookingModel.aggregate<{ _id: string; commission: number }>([
        { $match: { bookingDate: { $gte: yearStart, $lte: today }, status } },
        { $group: { _id: '$bookingDate', commission: { $sum: '$commissionPaise' } } },
      ]),
    ]);
    const summary = items.reduce(
      (value, item) => ({
        bookings: value.bookings + 1,
        grossRevenuePaise: value.grossRevenuePaise + item.finalAmountPaise,
        commissionPaise: value.commissionPaise + item.commissionPaise,
        ownerPayoutPaise: value.ownerPayoutPaise + item.ownerEarningsPaise,
        averageCommissionPercentage: 0,
      }),
      {
        bookings: 0,
        grossRevenuePaise: 0,
        commissionPaise: 0,
        ownerPayoutPaise: 0,
        averageCommissionPercentage: 0,
      },
    );
    summary.averageCommissionPercentage = summary.grossRevenuePaise
      ? Number(((summary.commissionPaise / summary.grossRevenuePaise) * 100).toFixed(2))
      : 0;
    const byDate = new Map<string, typeof summary>();
    for (const item of items) {
      const value = byDate.get(item.bookingDate) ?? {
        bookings: 0,
        grossRevenuePaise: 0,
        commissionPaise: 0,
        ownerPayoutPaise: 0,
        averageCommissionPercentage: 0,
      };
      value.bookings += 1;
      value.grossRevenuePaise += item.finalAmountPaise;
      value.commissionPaise += item.commissionPaise;
      value.ownerPayoutPaise += item.ownerEarningsPaise;
      value.averageCommissionPercentage = value.grossRevenuePaise
        ? Number(((value.commissionPaise / value.grossRevenuePaise) * 100).toFixed(2))
        : 0;
      byDate.set(item.bookingDate, value);
    }
    const commissionFrom = (date: string) =>
      snapshots.filter((item) => item._id >= date).reduce((sum, item) => sum + item.commission, 0);
    return {
      range: { startDate, endDate },
      summary,
      snapshots: {
        todayCommissionPaise: commissionFrom(today),
        monthCommissionPaise: commissionFrom(monthStart),
        yearCommissionPaise: commissionFrom(yearStart),
      },
      bookingTypes: {
        private: items.filter((item) => item.bookingType !== 'open_session').length,
        openSession: items.filter((item) => item.bookingType === 'open_session').length,
      },
      trend: [...byDate]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, value]) => ({ date, ...value })),
      transactions: items.map((item) => ({
        id: item._id.toString(),
        reference: item.reference,
        bookingDate: item.bookingDate,
        turfName: item.turfName,
        customerName: item.customerName,
        bookingType: item.bookingType ?? 'private',
        grossRevenuePaise: item.finalAmountPaise,
        commissionPaise: item.commissionPaise,
        ownerPayoutPaise: item.ownerEarningsPaise,
        commissionPercentage: item.commissionBasisPoints / 100,
      })),
    };
  }
  async getDashboard(now: Date, page = 1, limit = 6): Promise<AdminDashboardDTO> {
    const firstMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const firstDate = firstMonth.toISOString().slice(0, 10);
    const revenueStatuses = ['confirmed', 'completed'];
    const cancelledStatuses = [
      'cancelled_by_user',
      'cancelled_by_owner',
      'refunded',
      'partially_refunded',
    ];
    const [
      totalCustomers,
      totalOwners,
      approvedTurfs,
      totalBookings,
      pendingApplications,
      escalatedRefunds,
      activeOpenSessions,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      financials,
      trendRows,
      recent,
    ] = await Promise.all([
      UserModel.countDocuments({ roles: 'customer', status: 'active' }),
      UserModel.countDocuments({ roles: 'turf_owner', status: 'active' }),
      TurfModel.countDocuments({ status: 'approved', isDeleted: false }),
      BookingModel.countDocuments({ status: { $nin: ['pending_payment', 'expired'] } }),
      TurfOwnerApplicationModel.countDocuments({ status: 'pending' }),
      BookingModel.countDocuments({ paymentStatus: 'refund_escalated' }),
      OpenSessionModel.countDocuments({ status: { $in: ['open', 'full'] } }),
      BookingModel.countDocuments({ status: 'confirmed' }),
      BookingModel.countDocuments({ status: 'completed' }),
      BookingModel.countDocuments({ status: { $in: cancelledStatuses } }),
      BookingModel.aggregate<{ _id: null; gross: number; commission: number }>([
        { $match: { status: { $in: revenueStatuses } } },
        {
          $group: {
            _id: null,
            gross: { $sum: '$finalAmountPaise' },
            commission: { $sum: '$commissionPaise' },
          },
        },
      ]),
      BookingModel.aggregate<{ _id: string; bookings: number; revenuePaise: number }>([
        { $match: { bookingDate: { $gte: firstDate }, status: { $in: revenueStatuses } } },
        {
          $group: {
            _id: { $substrBytes: ['$bookingDate', 0, 7] },
            bookings: { $sum: 1 },
            revenuePaise: { $sum: '$finalAmountPaise' },
          },
        },
      ]),
      BookingModel.find({ status: { $nin: ['pending_payment', 'expired'] } })
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    const trends = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + index, 1),
      );
      const key = monthKey(date);
      const row = trendRows.find((item) => item._id === key);
      return {
        month: key,
        label: date.toLocaleDateString('en-IN', {
          month: 'short',
          year: '2-digit',
          timeZone: 'UTC',
        }),
        bookings: row?.bookings ?? 0,
        revenuePaise: row?.revenuePaise ?? 0,
      };
    });
    return {
      totalCustomers,
      totalOwners,
      approvedTurfs,
      totalBookings,
      grossRevenuePaise: financials[0]?.gross ?? 0,
      platformCommissionPaise: financials[0]?.commission ?? 0,
      pendingApplications,
      escalatedRefunds,
      activeOpenSessions,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      trends,
      pagination: {
        page,
        limit,
        total: totalBookings,
        totalPages: Math.max(1, Math.ceil(totalBookings / limit)),
      },
      recentBookings: recent.map((booking) => ({
        id: booking._id.toString(),
        reference: booking.reference,
        turfName: booking.turfName,
        customerName: booking.customerName,
        bookingDate: booking.bookingDate,
        amountPaise: booking.finalAmountPaise,
        status: booking.status,
        bookingType: booking.bookingType ?? 'private',
      })),
    };
  }
}
