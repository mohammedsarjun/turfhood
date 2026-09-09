import type { TurfDashboardDTO } from '@turfhood/shared';

export interface IGetOwnerDashboardUseCase {
  execute(ownerId: string, portalTurfId: string): Promise<TurfDashboardDTO>;
}
