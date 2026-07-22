import { expect } from 'chai';
import { ListMyTurfOwnerApplicationsUseCase } from '../../../src/application/turfOwnerApplication/use-cases/ListMyTurfOwnerApplicationsUseCase.js';
import { FakeTurfOwnerApplicationRepository } from '../../mocks/FakeTurfOwnerApplicationRepository.js';
import { buildTurfOwnerApplication } from '../../fixtures/turfOwnerApplications.fixture.js';

describe('ListMyTurfOwnerApplicationsUseCase', () => {
  it("returns every application the user has submitted, regardless of status", async () => {
    const applications = [
      buildTurfOwnerApplication({ id: 'application_1', status: 'pending' }),
      buildTurfOwnerApplication({ id: 'application_2', status: 'approved' }),
      buildTurfOwnerApplication({ id: 'application_3', status: 'rejected' }),
    ];
    const applicationRepository = new FakeTurfOwnerApplicationRepository({
      allByApplicant: applications,
    });
    const useCase = new ListMyTurfOwnerApplicationsUseCase(applicationRepository);

    const result = await useCase.execute('user_1');

    expect(result.map((item) => item.id)).to.deep.equal([
      'application_1',
      'application_2',
      'application_3',
    ]);
    expect(result.map((item) => item.status)).to.deep.equal(['pending', 'approved', 'rejected']);
  });

  it('returns an empty array when the user has never applied', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository({ allByApplicant: [] });
    const useCase = new ListMyTurfOwnerApplicationsUseCase(applicationRepository);

    const result = await useCase.execute('user_1');

    expect(result).to.deep.equal([]);
  });
});
