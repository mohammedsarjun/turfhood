import { expect } from 'chai';
import { CommissionSetting } from '@domain/commission/entities/CommissionSetting';
import type { ICommissionSettingRepository } from '@domain/commission/repositories/ICommissionSettingRepository';
import { ManageCommissionSettingUseCase } from '@application/commission/use-cases/ManageCommissionSettingUseCase';

class FakeCommissionRepository implements ICommissionSettingRepository {
  setting: CommissionSetting | null = null;
  updatedBy = '';
  async get() {
    return this.setting;
  }
  async save(setting: CommissionSetting, updatedBy: string) {
    this.setting = CommissionSetting.fromPersistence({
      basisPoints: setting.basisPoints,
      updatedAt: new Date('2026-09-02T12:00:00.000Z'),
    });
    this.updatedBy = updatedBy;
    return this.setting;
  }
}

describe('ManageCommissionSettingUseCase', () => {
  it('returns the default until an admin saves a setting', async () => {
    const result = await new ManageCommissionSettingUseCase(new FakeCommissionRepository()).get();
    expect(result).to.deep.equal({ percentage: 10 });
  });

  it('stores percentage with two-decimal precision and the updating admin', async () => {
    const repository = new FakeCommissionRepository();
    const result = await new ManageCommissionSettingUseCase(repository).update(12.25, 'admin-id');
    expect(result.percentage).to.equal(12.25);
    expect(repository.setting?.basisPoints).to.equal(1225);
    expect(repository.updatedBy).to.equal('admin-id');
  });

  for (const percentage of [0, 0.99, 50.01, 100, 12.345]) {
    it(`rejects invalid percentage ${percentage}`, async () => {
      try {
        await new ManageCommissionSettingUseCase(new FakeCommissionRepository()).update(
          percentage,
          'admin-id',
        );
        expect.fail('Expected validation error.');
      } catch (error) {
        expect(error).to.have.property('statusCode', 400);
      }
    });
  }
});
