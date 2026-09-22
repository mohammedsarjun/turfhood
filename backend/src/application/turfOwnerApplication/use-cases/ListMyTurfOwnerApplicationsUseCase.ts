import { inject, injectable } from 'tsyringe';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { TurfApplicationSummary } from '@turfhood/shared';

import { toTurfApplicationSummaryDTO } from '../mappers/toTurfApplicationSummaryDTO.js';

import type { IListMyTurfOwnerApplicationsUseCase } from './IListMyTurfOwnerApplicationsUseCase.js';

/** Every application the user has ever submitted, any status — backs the My Turfs page. */
@injectable()
export class ListMyTurfOwnerApplicationsUseCase implements IListMyTurfOwnerApplicationsUseCase {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository)
    private readonly applicationRepository: ITurfOwnerApplicationRepository,
    @inject(TURF_TOKENS.TurfRepository)
    private readonly turfRepository: ITurfRepository,
  ) {}

  async execute(
    userId: string,
    page = 1,
    limit = 9,
  ): Promise<import('@turfhood/shared').PaginatedResponse<TurfApplicationSummary>> {
    const result = await this.applicationRepository.list({ applicantUserId: userId, page, limit });
    const turfs = await this.turfRepository.findByVerificationIds(
      result.items.flatMap((application) => (application.id ? [application.id] : [])),
    );
    const turfsByVerificationId = new Map(
      turfs.flatMap((turf) => (turf.verificationId ? [[turf.verificationId, turf] as const] : [])),
    );
    return {
      items: result.items.map((application) => {
        const summary = toTurfApplicationSummaryDTO(application);
        const turf = turfsByVerificationId.get(application.id as string);
        if (!turf) return summary;
        return {
          ...summary,
          turfStatus: turf.status === 'suspended' ? 'suspended' : 'approved',
          ...(turf.suspensionReason ? { suspensionReason: turf.suspensionReason } : {}),
        };
      }),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }
}
