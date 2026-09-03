import { inject, injectable } from 'tsyringe';
import type { CommissionSettingDTO } from '@turfhood/shared';
import { CommissionSetting } from '@domain/commission/entities/CommissionSetting';
import type { ICommissionSettingRepository } from '@domain/commission/repositories/ICommissionSettingRepository';
import { COMMISSION_TOKENS } from '@domain/commission/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

import { DEFAULT_COMMISSION_PERCENTAGE, INVALID_COMMISSION_MESSAGE } from '../constants.js';
import type { IManageCommissionSettingUseCase } from './IManageCommissionSettingUseCase.js';

@injectable()
export class ManageCommissionSettingUseCase implements IManageCommissionSettingUseCase {
  constructor(
    @inject(COMMISSION_TOKENS.Repository)
    private readonly repository: ICommissionSettingRepository,
  ) {}

  async get(): Promise<CommissionSettingDTO> {
    const setting = await this.repository.get();
    return setting ? this.toDTO(setting) : { percentage: DEFAULT_COMMISSION_PERCENTAGE };
  }

  async update(percentage: number, updatedBy: string): Promise<CommissionSettingDTO> {
    if (percentage < 1 || percentage > 50 || !Number.isInteger(percentage * 100)) {
      throw new AppError(INVALID_COMMISSION_MESSAGE, HttpStatus.BAD_REQUEST);
    }
    return this.toDTO(
      await this.repository.save(CommissionSetting.fromPercentage(percentage), updatedBy),
    );
  }

  private toDTO(setting: CommissionSetting): CommissionSettingDTO {
    return {
      percentage: setting.percentage,
      ...(setting.updatedAt ? { updatedAt: setting.updatedAt.toISOString() } : {}),
    };
  }
}
