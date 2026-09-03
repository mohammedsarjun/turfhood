import type { CommissionSettingDTO } from '@turfhood/shared';

export interface IManageCommissionSettingUseCase {
  get(): Promise<CommissionSettingDTO>;
  update(percentage: number, updatedBy: string): Promise<CommissionSettingDTO>;
}
