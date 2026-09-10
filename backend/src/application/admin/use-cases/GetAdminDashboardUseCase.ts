import { inject, injectable } from 'tsyringe';
import type { AdminDashboardDTO } from '@turfhood/shared';
import type { IAdminDashboardRepository } from '@domain/admin/repositories/IAdminDashboardRepository';
import { ADMIN_TOKENS } from '@domain/admin/tokens';
import type { IGetAdminDashboardUseCase } from './IGetAdminDashboardUseCase.js';

@injectable()
export class GetAdminDashboardUseCase implements IGetAdminDashboardUseCase {
  constructor(
    @inject(ADMIN_TOKENS.DashboardRepository)
    private readonly dashboard: IAdminDashboardRepository,
  ) {}

  execute(page?: number, limit?: number): Promise<AdminDashboardDTO> {
    return this.dashboard.getDashboard(new Date(), page, limit);
  }
}
