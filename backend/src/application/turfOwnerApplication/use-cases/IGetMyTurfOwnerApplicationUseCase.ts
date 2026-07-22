import type { TurfApplicationSummary } from '@turfhood/shared';

export interface IGetMyTurfOwnerApplicationUseCase {
  execute(userId: string): Promise<TurfApplicationSummary | null>;
}
