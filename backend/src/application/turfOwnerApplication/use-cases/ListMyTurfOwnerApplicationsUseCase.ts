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

  async execute(userId: string): Promise<TurfApplicationSummary[]> {
    const applications = await this.applicationRepository.findAllByApplicant(userId);
    return applications.map(toTurfApplicationSummaryDTO);
  }
}
