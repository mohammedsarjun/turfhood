import type { TurfRevenueReportDTO } from '@turfhood/shared';
export interface IGetOwnerRevenueUseCase { execute(ownerId: string, portalTurfId: string, startDate: string, endDate: string): Promise<TurfRevenueReportDTO> }
