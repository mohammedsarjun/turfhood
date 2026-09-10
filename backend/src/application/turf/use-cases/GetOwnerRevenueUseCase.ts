import { inject, injectable } from 'tsyringe';
import type { RevenueSummaryDTO, TurfRevenueReportDTO } from '@turfhood/shared';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { IGetOwnerRevenueUseCase } from './IGetOwnerRevenueUseCase.js';

const indiaDate = (value: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(value);
const daysAgo = (days: number) => indiaDate(new Date(Date.now() - days * 86_400_000));

@injectable()
export class GetOwnerRevenueUseCase implements IGetOwnerRevenueUseCase {
  constructor(
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
  ) {}
  async execute(
    ownerId: string,
    portalTurfId: string,
    startDate: string,
    endDate: string,
    page?: number,
    limit = 20,
  ): Promise<TurfRevenueReportDTO> {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      startDate > endDate
    )
      throw new AppError('Choose a valid date range.', HttpStatus.BAD_REQUEST);
    const turf = await this.turfs.findOwnedByIdOrVerificationId(portalTurfId, ownerId);
    if (!turf?.id) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
    const today = indiaDate(new Date());
    const monthStart = `${today.slice(0, 7)}-01`;
    const [selected, todayData, weekData, monthData, bookingStatus] = await Promise.all([
      this.bookings.revenueBetween(turf.id, startDate, endDate),
      this.bookings.revenueBetween(turf.id, today, today),
      this.bookings.revenueBetween(turf.id, daysAgo(6), today),
      this.bookings.revenueBetween(turf.id, monthStart, today),
      this.bookings.statusCountsBetween(turf.id, startDate, endDate),
    ]);
    const byDate = new Map<string, RevenueSummaryDTO>();
    for (const item of selected.items) {
      const current = byDate.get(item.bookingDate) ?? {
        bookings: 0,
        grossRevenuePaise: 0,
        commissionPaise: 0,
        netEarningsPaise: 0,
      };
      byDate.set(item.bookingDate, {
        bookings: current.bookings + 1,
        grossRevenuePaise: current.grossRevenuePaise + item.subtotalPaise - item.discountPaise,
        commissionPaise: current.commissionPaise + item.commissionPaise,
        netEarningsPaise: current.netEarningsPaise + item.ownerEarningsPaise,
      });
    }
    const total = selected.items.length;
    const transactions = page
      ? selected.items.slice((page - 1) * limit, page * limit)
      : selected.items;
    return {
      ...(page
        ? { pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } }
        : {}),
      turfName: turf.name,
      selectedRange: { startDate, endDate, summary: selected.summary },
      snapshots: {
        today: todayData.summary,
        last7Days: weekData.summary,
        thisMonth: monthData.summary,
      },
      trend: [...byDate]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, summary]) => ({ date, ...summary })),
      bookingStatus,
      transactions: transactions.map((item) => ({
        id: item.id,
        reference: item.reference,
        bookingDate: item.bookingDate,
        customerName: item.customerName,
        courtName: item.courtName,
        grossRevenuePaise: item.subtotalPaise - item.discountPaise,
        commissionPaise: item.commissionPaise,
        netEarningsPaise: item.ownerEarningsPaise,
      })),
    };
  }
}
