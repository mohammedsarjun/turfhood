import type { CommissionSetting } from '../entities/CommissionSetting.js';

export interface ICommissionSettingRepository {
  get(): Promise<CommissionSetting | null>;
  save(setting: CommissionSetting, updatedBy: string): Promise<CommissionSetting>;
}
