import { inject, injectable } from 'tsyringe';
import type { IAdminManagementRepository } from '@domain/admin/repositories/IAdminManagementRepository';
import { ADMIN_TOKENS } from '@domain/admin/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

import { ADMIN_MANAGEMENT_MESSAGES } from '../constants/adminManagementMessages.js';
import type {
  AdminResourceListInput,
  IManageAdminResourcesUseCase,
} from './IManageAdminResourcesUseCase.js';

@injectable()
export class ManageAdminResourcesUseCase implements IManageAdminResourcesUseCase {
  constructor(
    @inject(ADMIN_TOKENS.ManagementRepository)
    private readonly repository: IAdminManagementRepository,
  ) {}

  async listUsers(input: AdminResourceListInput) {
    const result = await this.repository.listUsers(this.normalizeListInput(input));
    return this.withPagination(result, input.page, input.limit);
  }

  async suspendUser(id: string, reason: string) {
    const normalizedReason = this.normalizeReason(reason);
    const user = await this.repository.suspendUser(id, normalizedReason);
    if (!user) throw new AppError(ADMIN_MANAGEMENT_MESSAGES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    return user;
  }

  async unsuspendUser(id: string) {
    const user = await this.repository.unsuspendUser(id);
    if (!user) throw new AppError(ADMIN_MANAGEMENT_MESSAGES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    return user;
  }

  async listTurfs(input: AdminResourceListInput) {
    const result = await this.repository.listTurfs(this.normalizeListInput(input));
    return this.withPagination(result, input.page, input.limit);
  }

  async suspendTurf(id: string, reason: string) {
    const normalizedReason = this.normalizeReason(reason);
    const turf = await this.repository.suspendTurf(id, normalizedReason);
    if (!turf) throw new AppError(ADMIN_MANAGEMENT_MESSAGES.TURF_NOT_FOUND, HttpStatus.NOT_FOUND);
    return turf;
  }

  async unsuspendTurf(id: string) {
    const turf = await this.repository.unsuspendTurf(id);
    if (!turf) throw new AppError(ADMIN_MANAGEMENT_MESSAGES.TURF_NOT_FOUND, HttpStatus.NOT_FOUND);
    return turf;
  }

  private normalizeListInput(input: AdminResourceListInput): AdminResourceListInput {
    const search = input.search?.trim();
    return { page: input.page, limit: input.limit, ...(search ? { search } : {}) };
  }

  private normalizeReason(reason: string): string {
    const trimmed = reason.trim();
    if (!trimmed) {
      throw new AppError(
        ADMIN_MANAGEMENT_MESSAGES.SUSPENSION_REASON_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trimmed.length > 300) {
      throw new AppError(
        ADMIN_MANAGEMENT_MESSAGES.SUSPENSION_REASON_TOO_LONG,
        HttpStatus.BAD_REQUEST,
      );
    }
    return trimmed;
  }

  private withPagination<T>(
    result: { items: T[]; total: number },
    page: number,
    limit: number,
  ): import('@turfhood/shared').PaginatedResponse<T> {
    return {
      items: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }
}
