import { inject, injectable } from 'tsyringe';
import { ApplicationAlreadyReviewedError } from '@domain/turfOwnerApplication/errors/ApplicationAlreadyReviewedError';
import { TurfOwnerApplicationNotFoundError } from '@domain/turfOwnerApplication/errors/TurfOwnerApplicationNotFoundError';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import type { TurfApplicationSummary } from '@turfhood/shared';

import type { RejectTurfOwnerApplicationRequestDTO } from '../dtos/RejectTurfOwnerApplicationRequestDTO.js';
import { toTurfApplicationSummaryDTO } from '../mappers/toTurfApplicationSummaryDTO.js';

import type { IRejectTurfOwnerApplicationUseCase } from './IRejectTurfOwnerApplicationUseCase.js';

/** Rejection never touches the user's role — only marks the application rejected with a reason. */
@injectable()
export class RejectTurfOwnerApplicationUseCase implements IRejectTurfOwnerApplicationUseCase {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository)
    private readonly applicationRepository: ITurfOwnerApplicationRepository,
  ) {}

  async execute(request: RejectTurfOwnerApplicationRequestDTO): Promise<TurfApplicationSummary> {
    const application = await this.applicationRepository.findById(request.applicationId);
    if (!application) {
      throw new TurfOwnerApplicationNotFoundError();
    }
    if (application.status !== 'pending') {
      throw new ApplicationAlreadyReviewedError();
    }

    const updated = await this.applicationRepository.reject(
      request.applicationId,
      request.reviewedBy,
      request.reason,
    );
    if (!updated) {
      throw new TurfOwnerApplicationNotFoundError();
    }

    return toTurfApplicationSummaryDTO(updated);
  }
}
