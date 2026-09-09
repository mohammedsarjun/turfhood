import type { AdminDashboardDTO } from '@turfhood/shared';

export interface IGetAdminDashboardUseCase {
  execute(): Promise<AdminDashboardDTO>;
}
