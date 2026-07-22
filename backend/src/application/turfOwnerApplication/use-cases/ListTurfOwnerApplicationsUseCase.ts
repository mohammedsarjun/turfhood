import { inject, injectable } from 'tsyringe';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import type { PaginatedResponse, TurfApplicationSummary } from '@turfhood/shared';

import type { ListTurfOwnerApplicationsRequestDTO } from '../dtos/ListTurfOwnerApplicationsRequestDTO.js';
import { toTurfApplicationSummaryDTO } from '../mappers/toTurfApplicationSummaryDTO.js';

import type { IListTurfOwnerApplicationsUseCase } from './IListTurfOwnerApplicationsUseCase.js';

@injectable()
export class ListTurfOwnerApplicationsUseCase implements IListTurfOwnerApplicationsUseCase {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository)
    private readonly applicationRepository: ITurfOwnerApplicationRepository,
  ) {}

  async execute(
    request: ListTurfOwnerApplicationsRequestDTO,
  ): Promise<PaginatedResponse<TurfApplicationSummary>> {
    const { items, total } = await this.applicationRepository.list(request);

    return {
      items: items.map(toTurfApplicationSummaryDTO),
      pagination: {
        page: request.page,
        limit: request.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / request.limit)),
      },
    };
  }
}
