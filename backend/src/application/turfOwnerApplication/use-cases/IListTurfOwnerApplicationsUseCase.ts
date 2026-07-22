import type { PaginatedResponse, TurfApplicationSummary } from '@turfhood/shared';

import type { ListTurfOwnerApplicationsRequestDTO } from '../dtos/ListTurfOwnerApplicationsRequestDTO.js';

export interface IListTurfOwnerApplicationsUseCase {
  execute(
    request: ListTurfOwnerApplicationsRequestDTO,
  ): Promise<PaginatedResponse<TurfApplicationSummary>>;
}
