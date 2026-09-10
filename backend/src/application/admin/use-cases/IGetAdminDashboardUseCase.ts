import type { AdminDashboardDTO } from '@turfhood/shared';

export interface IGetAdminDashboardUseCase {
  execute(page?: number, limit?: number): Promise<AdminDashboardDTO>;
}
