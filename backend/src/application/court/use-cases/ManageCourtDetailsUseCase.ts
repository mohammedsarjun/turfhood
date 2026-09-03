import { inject, injectable } from 'tsyringe';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import { CourtAccessError } from '@domain/court/errors/CourtAccessError';
import {
  AvailabilityOverrideNotFoundError,
  BookedSlotOverrideError,
  DuplicateAvailabilityOverrideError,
  InvalidBlockedSlotError,
} from '@domain/court/errors/AvailabilityOverrideError';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import { DuplicateCourtNameError } from '@domain/court/errors/DuplicateCourtNameError';
import type { CourtAccessInput, IManageCourtDetailsUseCase } from './IManageCourtDetailsUseCase.js';
import { generateSlots } from './GetPublicCourtDetailsUseCase.js';

@injectable()
export class ManageCourtDetailsUseCase implements IManageCourtDetailsUseCase {
  constructor(
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
  ) {}

  private async resolve(input: CourtAccessInput) {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(input.portalTurfId, input.ownerId);
    if (!turf?.id) throw new CourtAccessError();
    const court = await this.courts.findByIdAndTurf(input.courtId, turf.id);
    if (!court) throw new CourtAccessError('The requested court was not found.');
    return { turf, court };
  }

  async get(input: CourtAccessInput) {
    const { court } = await this.resolve(input);
    return { court, availabilityOverrides: await this.courts.listOverrides(court.id) };
  }

  async createOverride(input: Parameters<IManageCourtDetailsUseCase['createOverride']>[0]) {
    const { turf, court } = await this.resolve(input);
    await this.validateBlockedSlots(court, input.date, input.blockedSlots, input.isClosed);
    try {
      return await this.courts.createOverride({
        turfId: turf.id!,
        courtId: court.id,
        date: input.date,
        isClosed: input.isClosed,
        ...(input.closureReason ? { closureReason: input.closureReason } : {}),
        blockedSlots: input.blockedSlots,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: unknown }).code === 11000
      )
        throw new DuplicateAvailabilityOverrideError();
      throw error;
    }
  }

  async updateOverride(input: Parameters<IManageCourtDetailsUseCase['updateOverride']>[0]) {
    const { court } = await this.resolve(input);
    await this.validateBlockedSlots(court, input.date, input.blockedSlots, input.isClosed);
    const updated = await this.courts.updateOverride(input.overrideId, court.id, {
      date: input.date,
      isClosed: input.isClosed,
      ...(input.closureReason ? { closureReason: input.closureReason } : {}),
      blockedSlots: input.blockedSlots,
    });
    if (!updated) throw new AvailabilityOverrideNotFoundError();
    return updated;
  }

  async deleteOverride(input: Parameters<IManageCourtDetailsUseCase['deleteOverride']>[0]) {
    const { court } = await this.resolve(input);
    if (!(await this.courts.deleteOverride(input.overrideId, court.id)))
      throw new AvailabilityOverrideNotFoundError();
  }

  async update(input: Parameters<IManageCourtDetailsUseCase['update']>[0]) {
    const { turf, court } = await this.resolve(input);
    if (await this.courts.existsByName(turf.id!, input.name, court.id)) {
      throw new DuplicateCourtNameError(input.name);
    }
    const updated = await this.courts.update(court.id, {
      name: input.name,
      sportTypeIds: input.sportTypeIds,
      capacity: input.capacity,
      status: input.status,
      allowOpenSessions: input.allowOpenSessions,
      minPlayersForOpenSession: input.minPlayersForOpenSession,
      slotDurationMinutes: input.slotDurationMinutes,
      pricingRules: input.pricingRules,
    });
    if (!updated) throw new CourtAccessError('The requested court was not found.');
    return updated;
  }

  private async validateBlockedSlots(
    court: Awaited<ReturnType<ICourtRepository['findByIdAndTurf']>> & {},
    date: string,
    blockedSlots: Array<{ startTime: string; endTime: string }>,
    isClosed: boolean,
  ): Promise<void> {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    const valid = new Set(
      generateSlots(court, date, day === 0 || day === 6 ? 'weekend' : 'weekday').map(
        (slot) => `${slot.startTime}-${slot.endTime}`,
      ),
    );
    if (blockedSlots.some((slot) => !valid.has(`${slot.startTime}-${slot.endTime}`))) {
      throw new InvalidBlockedSlotError();
    }
    const occupied =
      (await this.bookings.occupiedStarts(court.id, [date], new Date())).get(date) ??
      new Map<string, 'held' | 'confirmed'>();
    if (
      occupied.size > 0 &&
      (isClosed || blockedSlots.some((slot) => occupied.has(slot.startTime)))
    ) {
      throw new BookedSlotOverrideError();
    }
  }
}
