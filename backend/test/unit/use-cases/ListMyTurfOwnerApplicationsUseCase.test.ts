import { expect } from 'chai';
import { ListMyTurfOwnerApplicationsUseCase } from '../../../src/application/turfOwnerApplication/use-cases/ListMyTurfOwnerApplicationsUseCase.js';
import { FakeTurfOwnerApplicationRepository } from '../../mocks/FakeTurfOwnerApplicationRepository.js';
import { buildTurfOwnerApplication } from '../../fixtures/turfOwnerApplications.fixture.js';

describe('ListMyTurfOwnerApplicationsUseCase', () => {
  it('paginates only the current applicant and returns the full matching count', async () => {
    const repository = new FakeTurfOwnerApplicationRepository({
      allByApplicant: [
        buildTurfOwnerApplication({ id: 'one' }),
        buildTurfOwnerApplication({ id: 'other', applicantUserId: 'user_2' }),
        buildTurfOwnerApplication({ id: 'two' }),
        buildTurfOwnerApplication({ id: 'three' }),
      ],
    });
    const result = await new ListMyTurfOwnerApplicationsUseCase(repository).execute('user_1', 2, 2);
    expect(result.items.map((item) => item.id)).to.deep.equal(['three']);
    expect(result.pagination).to.deep.equal({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });
  it('returns every application the user has submitted, regardless of status', async () => {
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

    expect(result.items.map((item) => item.id)).to.deep.equal([
      'application_1',
      'application_2',
      'application_3',
    ]);
    expect(result.items.map((item) => item.status)).to.deep.equal([
      'pending',
      'approved',
      'rejected',
    ]);
  });

  it('returns an empty array when the user has never applied', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository({ allByApplicant: [] });
    const useCase = new ListMyTurfOwnerApplicationsUseCase(applicationRepository);

    const result = await useCase.execute('user_1');

    expect(result.items).to.deep.equal([]);
    expect(result.pagination).to.deep.equal({ page: 1, limit: 9, total: 0, totalPages: 1 });
  });
});
