import type { TurfApplicationSummary } from '@turfhood/shared';

export interface IListMyTurfOwnerApplicationsUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<import('@turfhood/shared').PaginatedResponse<TurfApplicationSummary>>;
}
