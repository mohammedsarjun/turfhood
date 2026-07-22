import { inject, injectable } from 'tsyringe';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import type { TurfApplicationSummary } from '@turfhood/shared';

import { toTurfApplicationSummaryDTO } from '../mappers/toTurfApplicationSummaryDTO.js';

import type { IGetMyTurfOwnerApplicationUseCase } from './IGetMyTurfOwnerApplicationUseCase.js';

/** Drives the profile-menu's status-aware routing: null means the user has never applied. */
@injectable()
export class GetMyTurfOwnerApplicationUseCase implements IGetMyTurfOwnerApplicationUseCase {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository)
    private readonly applicationRepository: ITurfOwnerApplicationRepository,
  ) {}

  async execute(userId: string): Promise<TurfApplicationSummary | null> {
    const application = await this.applicationRepository.findLatestByApplicant(userId);
    return application ? toTurfApplicationSummaryDTO(application) : null;
  }
}
