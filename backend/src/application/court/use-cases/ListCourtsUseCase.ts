import { inject, injectable } from 'tsyringe';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import { CourtAccessError } from '@domain/court/errors/CourtAccessError';

import type { IListCourtsUseCase } from './IListCourtsUseCase.js';

@injectable()
export class ListCourtsUseCase implements IListCourtsUseCase {
  constructor(
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
  ) {}

  async execute(input: Parameters<IListCourtsUseCase['execute']>[0]) {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(input.portalTurfId, input.ownerId);
    if (!turf?.id) throw new CourtAccessError();
    const result = await this.courts.list({
      turfId: turf.id,
      page: input.page,
      limit: input.limit,
      ...(input.search ? { search: input.search } : {}),
    });
    return {
      items: result.items,
      pagination: {
        page: input.page,
        limit: input.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / input.limit)),
      },
    };
  }
}
