import { inject, injectable } from 'tsyringe';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import type { TurfApplicationSummary } from '@turfhood/shared';

import { toTurfApplicationSummaryDTO } from '../mappers/toTurfApplicationSummaryDTO.js';

import type { IListMyTurfOwnerApplicationsUseCase } from './IListMyTurfOwnerApplicationsUseCase.js';

/** Every application the user has ever submitted, any status — backs the My Turfs page. */
@injectable()
export class ListMyTurfOwnerApplicationsUseCase implements IListMyTurfOwnerApplicationsUseCase {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository)
    private readonly applicationRepository: ITurfOwnerApplicationRepository,
  ) {}

  async execute(
    userId: string,
    page = 1,
    limit = 9,
  ): Promise<import('@turfhood/shared').PaginatedResponse<TurfApplicationSummary>> {
    const result = await this.applicationRepository.list({ applicantUserId: userId, page, limit });
    return {
      items: result.items.map(toTurfApplicationSummaryDTO),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }
}
