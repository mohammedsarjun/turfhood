import type {
  AdminTurfListResponse,
  AdminTurfSummaryDTO,
  AdminUserListResponse,
  AdminUserSummaryDTO,
} from '@turfhood/shared';

export interface AdminResourceListInput {
  page: number;
  limit: number;
  search?: string;
}

export interface IManageAdminResourcesUseCase {
  listUsers(input: AdminResourceListInput): Promise<AdminUserListResponse>;
  suspendUser(id: string, reason: string): Promise<AdminUserSummaryDTO>;
  unsuspendUser(id: string): Promise<AdminUserSummaryDTO>;
  listTurfs(input: AdminResourceListInput): Promise<AdminTurfListResponse>;
  suspendTurf(id: string, reason: string): Promise<AdminTurfSummaryDTO>;
  unsuspendTurf(id: string): Promise<AdminTurfSummaryDTO>;
}
