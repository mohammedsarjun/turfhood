import type { TurfApplicationSummary } from '@turfhood/shared';

export interface IListMyTurfOwnerApplicationsUseCase {
  execute(userId: string): Promise<TurfApplicationSummary[]>;
}
