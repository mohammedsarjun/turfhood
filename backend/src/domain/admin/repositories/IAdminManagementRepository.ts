import type { AdminTurfSummaryDTO, AdminUserSummaryDTO } from '@turfhood/shared';

export interface AdminManagementListParams {
  page: number;
  limit: number;
  search?: string;
}

export interface AdminManagementListResult<T> {
  items: T[];
  total: number;
}

export interface IAdminManagementRepository {
  listUsers(
    params: AdminManagementListParams,
  ): Promise<AdminManagementListResult<AdminUserSummaryDTO>>;
  suspendUser(id: string, reason: string): Promise<AdminUserSummaryDTO | null>;
  unsuspendUser(id: string): Promise<AdminUserSummaryDTO | null>;
  listTurfs(
    params: AdminManagementListParams,
  ): Promise<AdminManagementListResult<AdminTurfSummaryDTO>>;
  suspendTurf(id: string, reason: string): Promise<AdminTurfSummaryDTO | null>;
  unsuspendTurf(id: string): Promise<AdminTurfSummaryDTO | null>;
}
