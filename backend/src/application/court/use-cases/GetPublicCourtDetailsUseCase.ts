import { inject, injectable } from 'tsyringe';
import type {
  AvailabilityOverrideDTO,
  AvailabilityPeriodDTO,
  CourtDTO,
  PricingRuleDTO,
  PublicCourtDetailsResponse,
  PublicCourtSlotDTO,
  SlotPeriod,
} from '@turfhood/shared';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import { BOOKING_TOKENS } from '@domain/booking/tokens';

import type { IGetPublicCourtDetailsUseCase } from './IGetPublicCourtDetailsUseCase.js';

const MINUTES_PER_DAY = 24 * 60;

function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function periodFor(minutes: number): SlotPeriod {
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 17 * 60) return 'afternoon';
  if (minutes < 21 * 60) return 'evening';
  return 'night';
}

function priceForStart(
  rules: Array<Pick<PricingRuleDTO, 'startTime' | 'endTime' | 'pricePerSlot'>>,
  start: number,
): number | undefined {
  const ordered = [...rules].sort((left, right) => left.startTime.localeCompare(right.startTime));
  const matching = ordered.find(
    (rule) => toMinutes(rule.startTime) <= start && start < toMinutes(rule.endTime),
  );
  if (matching) return matching.pricePerSlot;

  return undefined;
}

export function generateSlots(
  court: CourtDTO,
  date: string,
  dayType: 'weekday' | 'weekend',
  override?: AvailabilityOverrideDTO,
): PublicCourtSlotDTO[] {
  if (override?.isClosed) return [];
  const rules = court.pricingRules.filter((rule) => rule.dayType === dayType);
  const blocked = new Set(
    (override?.blockedSlots ?? []).map((slot) => `${slot.startTime}-${slot.endTime}`),
  );
  const slots: PublicCourtSlotDTO[] = [];
  const windows: AvailabilityPeriodDTO[] = rules.map((rule) => ({
    startTime: rule.startTime,
    endTime: rule.endTime,
  }));

  for (const window of windows) {
    const windowStart = toMinutes(window.startTime);
    const windowEnd = toMinutes(window.endTime);
    for (
      let start = windowStart;
      start + court.slotDurationMinutes <= windowEnd;
      start += court.slotDurationMinutes
    ) {
      const end = start + court.slotDurationMinutes;
      if (end > MINUTES_PER_DAY) break;
      if (blocked.has(`${toTime(start)}-${toTime(end)}`)) continue;
      const price = priceForStart(rules, start);
      if (price === undefined) continue;
      slots.push({
        id: `${date}-${toTime(start)}-${toTime(end)}`,
        startTime: toTime(start),
        endTime: toTime(end),
        price,
        period: periodFor(start),
        available: true,
      });
    }
  }
  return slots.sort((left, right) => left.startTime.localeCompare(right.startTime));
}

function localDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@injectable()
export class GetPublicCourtDetailsUseCase implements IGetPublicCourtDetailsUseCase {
  constructor(
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository) private readonly sports: ISportsTypeRepository,
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
  ) {}

  async execute(
    turfId: string,
    courtId: string,
    today = new Date(),
  ): Promise<PublicCourtDetailsResponse> {
    const [turf, court] = await Promise.all([
      this.turfs.findApprovedById(turfId),
      this.courts.findByIdAndTurf(courtId, turfId),
    ]);
    if (!turf || !court || court.status !== 'active') {
      throw new AppError('Court not found.', HttpStatus.NOT_FOUND);
    }
    const dateValues = Array.from(
      { length: 14 },
      (_, offset) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset),
    );
    const dateKeys = dateValues.map(localDate);
    const [overrides, sportResult, occupied] = await Promise.all([
      this.courts.listOverrides(courtId),
      this.sports.list({ page: 1, limit: 100, isListed: true }),
      this.bookings.occupiedStarts(courtId, dateKeys, today),
    ]);
    const sportNames = new Map(
      sportResult.items.flatMap((sport) => (sport.id ? [[sport.id, sport.name] as const] : [])),
    );
    const overridesByDate = new Map(overrides.map((override) => [override.date, override]));
    const dates = dateValues.map((value) => {
      const date = localDate(value);
      const override = overridesByDate.get(date);
      const day = value.getDay();
      const blocked = new Set(
        (override?.blockedSlots ?? []).map((slot) => `${slot.startTime}-${slot.endTime}`),
      );
      const slots = generateSlots(court, date, day === 0 || day === 6 ? 'weekend' : 'weekday').map(
        (slot) => {
          const occupancy = occupied.get(date)?.get(slot.startTime);
          const reason = override?.isClosed
            ? 'closed'
            : blocked.has(`${slot.startTime}-${slot.endTime}`)
              ? 'blocked'
              : occupancy
                ? occupancy === 'held'
                  ? 'reserved'
                  : 'booked'
                : new Date(`${date}T${slot.startTime}:00+05:30`) <= today
                  ? 'past'
                  : undefined;
          return {
            ...slot,
            available: !reason,
            ...(reason
              ? {
                  unavailableReason: reason as
                    'booked' | 'reserved' | 'blocked' | 'past' | 'closed',
                }
              : {}),
          };
        },
      );
      return { date, isClosed: override?.isClosed ?? false, slots };
    });
    const prices = court.pricingRules.map((rule: PricingRuleDTO) => rule.pricePerSlot);
    return {
      turf: { id: turf.id!, name: turf.name },
      court: {
        id: court.id,
        name: court.name,
        images: court.images.map((image) => image.url),
        sports: court.sportTypeIds.flatMap((id) => {
          const name = sportNames.get(id);
          return name ? [name] : [];
        }),
        capacity: court.capacity,
        slotDurationMinutes: court.slotDurationMinutes,
        allowOpenSessions: court.allowOpenSessions,
        ...(prices.length ? { startingPricePerSlot: Math.min(...prices) } : {}),
      },
      ...(court.allowOpenSessions
        ? {
            openSessionPolicy: {
              minimumPlayers: court.minPlayersForOpenSession,
              sportOptions: court.sportTypeIds.flatMap((id) => {
                const name = sportNames.get(id);
                return name ? [{ id, name }] : [];
              }),
            },
          }
        : {}),
      dates,
    };
  }
}
