import type { TurfRevenueReportDTO } from '@turfhood/shared';
export interface IGetOwnerRevenueUseCase {
  execute(
    ownerId: string,
    portalTurfId: string,
    startDate: string,
    endDate: string,
    page?: number,
    limit?: number,
  ): Promise<TurfRevenueReportDTO>;
}
