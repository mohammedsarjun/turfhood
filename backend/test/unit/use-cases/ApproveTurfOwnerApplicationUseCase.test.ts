import { expect } from 'chai';
import { ApproveTurfOwnerApplicationUseCase } from '../../../src/application/turfOwnerApplication/use-cases/ApproveTurfOwnerApplicationUseCase.js';
import { ApplicationAlreadyReviewedError } from '../../../src/domain/turfOwnerApplication/errors/ApplicationAlreadyReviewedError.js';
import { FakeTurfOwnerApplicationRepository } from '../../mocks/FakeTurfOwnerApplicationRepository.js';
import { FakeTurfRepository } from '../../mocks/FakeTurfRepository.js';
import { FakeTurfImageRepository } from '../../mocks/FakeTurfImageRepository.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeAmenityRepository } from '../../mocks/FakeAmenityRepository.js';
import { buildTurfOwnerApplication } from '../../fixtures/turfOwnerApplications.fixture.js';
import { buildPersistedUser } from '../../fixtures/users.fixture.js';

function buildUseCase(application: ReturnType<typeof buildTurfOwnerApplication>) {
  const applicationRepository = new FakeTurfOwnerApplicationRepository({ existingById: application });
  const turfRepository = new FakeTurfRepository();
  const turfImageRepository = new FakeTurfImageRepository();
  const userRepository = new FakeUserRepository({
    existingUserById: buildPersistedUser({ id: application.applicantUserId }),
  });
  const amenityRepository = new FakeAmenityRepository();
  const useCase = new ApproveTurfOwnerApplicationUseCase(
    applicationRepository,
    turfRepository,
    turfImageRepository,
    userRepository,
    amenityRepository,
  );
  return { useCase, applicationRepository, turfRepository, turfImageRepository, userRepository };
}

describe('ApproveTurfOwnerApplicationUseCase', () => {
  it('creates the Turf, its turf_images, upgrades the applicant to turf_owner, and marks the application approved', async () => {
    const application = buildTurfOwnerApplication({ status: 'pending', applicantUserId: 'user_1' });
    const { useCase, applicationRepository, turfRepository, turfImageRepository, userRepository } =
      buildUseCase(application);

    const result = await useCase.execute({ applicationId: 'application_1', reviewedBy: 'admin_1' });

    expect(turfRepository.createCalls).to.have.length(1);
    expect(turfRepository.createCalls[0]?.ownerId).to.equal('user_1');
    expect(turfImageRepository.createManyCalls).to.have.length(1);
    expect(turfImageRepository.createManyCalls[0]?.images).to.deep.equal(application.images);
    expect(userRepository.addRoleCalls).to.deep.equal([{ userId: 'user_1', role: 'turf_owner' }]);
    expect(applicationRepository.approveCalls).to.have.length(1);
    expect(result.status).to.equal('approved');
  });

  it('skips creating turf_images when the application has none', async () => {
    const application = buildTurfOwnerApplication({
      status: 'pending',
      applicantUserId: 'user_1',
      images: [],
    });
    const { useCase, turfImageRepository } = buildUseCase(application);

    await useCase.execute({ applicationId: 'application_1', reviewedBy: 'admin_1' });

    expect(turfImageRepository.createManyCalls).to.have.length(0);
  });

  it('throws ApplicationAlreadyReviewedError when the application is not pending', async () => {
    const application = buildTurfOwnerApplication({ status: 'approved' });
    const { useCase, turfRepository, userRepository } = buildUseCase(application);

    try {
      await useCase.execute({ applicationId: 'application_1', reviewedBy: 'admin_1' });
      expect.fail('Expected execute() to throw ApplicationAlreadyReviewedError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(ApplicationAlreadyReviewedError);
    }
    expect(turfRepository.createCalls).to.have.length(0);
    expect(userRepository.addRoleCalls).to.have.length(0);
  });
});
