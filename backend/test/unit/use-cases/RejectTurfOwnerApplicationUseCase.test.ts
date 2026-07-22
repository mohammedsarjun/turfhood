import { expect } from 'chai';
import { RejectTurfOwnerApplicationUseCase } from '../../../src/application/turfOwnerApplication/use-cases/RejectTurfOwnerApplicationUseCase.js';
import { ApplicationAlreadyReviewedError } from '../../../src/domain/turfOwnerApplication/errors/ApplicationAlreadyReviewedError.js';
import { FakeTurfOwnerApplicationRepository } from '../../mocks/FakeTurfOwnerApplicationRepository.js';
import { buildTurfOwnerApplication } from '../../fixtures/turfOwnerApplications.fixture.js';

describe('RejectTurfOwnerApplicationUseCase', () => {
  it('marks the application rejected with the given reason and leaves role untouched', async () => {
    const application = buildTurfOwnerApplication({ status: 'pending' });
    const applicationRepository = new FakeTurfOwnerApplicationRepository({
      existingById: application,
    });
    const useCase = new RejectTurfOwnerApplicationUseCase(applicationRepository);

    const result = await useCase.execute({
      applicationId: 'application_1',
      reviewedBy: 'admin_1',
      reason: 'Documents were unclear.',
    });

    expect(applicationRepository.rejectCalls).to.deep.equal([
      { id: 'application_1', reviewedBy: 'admin_1', reason: 'Documents were unclear.' },
    ]);
    expect(result.status).to.equal('rejected');
    expect(result.reviewNotes).to.equal('Documents were unclear.');
  });

  it('throws ApplicationAlreadyReviewedError when the application is not pending', async () => {
    const application = buildTurfOwnerApplication({ status: 'rejected' });
    const applicationRepository = new FakeTurfOwnerApplicationRepository({
      existingById: application,
    });
    const useCase = new RejectTurfOwnerApplicationUseCase(applicationRepository);

    try {
      await useCase.execute({ applicationId: 'application_1', reviewedBy: 'admin_1' });
      expect.fail('Expected execute() to throw ApplicationAlreadyReviewedError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(ApplicationAlreadyReviewedError);
    }
  });
});
