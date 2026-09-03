import { injectable } from 'tsyringe';
import { CommissionSetting } from '@domain/commission/entities/CommissionSetting';
import type { ICommissionSettingRepository } from '@domain/commission/repositories/ICommissionSettingRepository';

import { CommissionSettingModel } from '../models/CommissionSettingModel.js';

@injectable()
export class CommissionSettingRepository implements ICommissionSettingRepository {
  async get(): Promise<CommissionSetting | null> {
    const document = await CommissionSettingModel.findOne({ key: 'platform_commission' });
    return document
      ? CommissionSetting.fromPersistence({
          basisPoints: document.basisPoints,
          updatedAt: document.updatedAt,
        })
      : null;
  }

  async save(setting: CommissionSetting, updatedBy: string): Promise<CommissionSetting> {
    const document = await CommissionSettingModel.findOneAndUpdate(
      { key: 'platform_commission' },
      {
        $set: { basisPoints: setting.basisPoints, updatedBy },
        $setOnInsert: { key: 'platform_commission' },
      },
      { upsert: true, new: true, runValidators: true },
    );
    return CommissionSetting.fromPersistence({
      basisPoints: document.basisPoints,
      updatedAt: document.updatedAt,
    });
  }
}
