import { expect } from 'chai';
import { SubmitTurfOwnerApplicationUseCase } from '../../../src/application/turfOwnerApplication/use-cases/SubmitTurfOwnerApplicationUseCase.js';
import { DuplicatePendingApplicationError } from '../../../src/domain/turfOwnerApplication/errors/DuplicatePendingApplicationError.js';
import { InvalidCoordinatesError } from '../../../src/domain/turfOwnerApplication/errors/InvalidCoordinatesError.js';
import { InvalidDocumentFileError } from '../../../src/domain/turfOwnerApplication/errors/InvalidDocumentFileError.js';
import { InvalidLocationError } from '../../../src/domain/turfOwnerApplication/errors/InvalidLocationError.js';
import { InvalidTurfImageError } from '../../../src/domain/turfOwnerApplication/errors/InvalidTurfImageError.js';
import { FakeTurfOwnerApplicationRepository } from '../../mocks/FakeTurfOwnerApplicationRepository.js';
import { FakeFileStorageService } from '../../mocks/FakeFileStorageService.js';
import { FakeLocationLookupService } from '../../mocks/FakeLocationLookupService.js';
import { buildTurfOwnerApplication } from '../../fixtures/turfOwnerApplications.fixture.js';

function buildImage(overrides: { isCover?: boolean; mimeType?: string; sizeBytes?: number } = {}) {
  return {
    buffer: Buffer.from('fake-image-bytes'),
    filename: 'cover.jpg',
    mimeType: overrides.mimeType ?? 'image/jpeg',
    sizeBytes: overrides.sizeBytes ?? 1024,
    isCover: overrides.isCover ?? true,
  };
}

function buildRequest(overrides: Record<string, unknown> = {}) {
  return {
    applicantUserId: 'user_1',
    name: 'Green Turf Arena',
    address: {
      line1: '12 Anna Salai',
      city: 'Chennai',
      cityCode: '1',
      state: 'Tamil Nadu',
      stateCode: 'TN',
      country: 'India',
      countryCode: 'IN',
      pincode: '600002',
    },
    coordinates: { lat: 13.0827, lng: 80.2707 },
    sportsOffered: ['sport_1'],
    amenities: [],
    documents: [
      {
        type: 'lease_agreement',
        buffer: Buffer.from('fake-doc-bytes'),
        filename: 'lease.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      },
    ],
    images: [buildImage()],
    ...overrides,
  };
}

describe('SubmitTurfOwnerApplicationUseCase', () => {
  it('persists a valid application with pending status and uploads the document + image', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/lease.pdf' });
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    const result = await useCase.execute(buildRequest() as never);

    expect(fileStorageService.uploadCalls).to.have.length(2);
    expect(applicationRepository.createCalls).to.have.length(1);
    expect(result.status).to.equal('pending');
    expect(result.documents).to.deep.equal([{ type: 'lease_agreement', url: 'http://cdn.test/lease.pdf' }]);
    expect(result.images).to.deep.equal([{ url: 'http://cdn.test/lease.pdf', isCover: true }]);
  });

  it('rejects an invalid country/state/city combination', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    try {
      await useCase.execute(
        buildRequest({
          address: {
            line1: '1 Main St',
            city: 'Nonexistent City',
            cityCode: 'nonexistent',
            state: 'Tamil Nadu',
            stateCode: 'TN',
            country: 'India',
            countryCode: 'IN',
            pincode: '600002',
          },
        }) as never,
      );
      expect.fail('Expected execute() to throw InvalidLocationError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidLocationError);
    }
  });

  it('rejects missing/out-of-range coordinates', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    try {
      await useCase.execute(buildRequest({ coordinates: { lat: 999, lng: 80.27 } }) as never);
      expect.fail('Expected execute() to throw InvalidCoordinatesError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidCoordinatesError);
    }
  });

  it('rejects a duplicate submission while one is still pending', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository({
      existingPendingByApplicant: buildTurfOwnerApplication(),
    });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    try {
      await useCase.execute(buildRequest() as never);
      expect.fail('Expected execute() to throw DuplicatePendingApplicationError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(DuplicatePendingApplicationError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('rejects an invalid document file before uploading anything', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    try {
      await useCase.execute(
        buildRequest({
          documents: [
            {
              type: 'lease_agreement',
              buffer: Buffer.from('x'),
              filename: 'malware.exe',
              mimeType: 'application/x-msdownload',
              sizeBytes: 1024,
            },
          ],
        }) as never,
      );
      expect.fail('Expected execute() to throw InvalidDocumentFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidDocumentFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('rejects zero turf images', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    try {
      await useCase.execute(buildRequest({ images: [] }) as never);
      expect.fail('Expected execute() to throw InvalidTurfImageError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidTurfImageError);
    }
  });

  it('rejects more than 10 turf images', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    const images = Array.from({ length: 11 }, (_, index) =>
      buildImage({ isCover: index === 0 }),
    );

    try {
      await useCase.execute(buildRequest({ images }) as never);
      expect.fail('Expected execute() to throw InvalidTurfImageError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidTurfImageError);
    }
  });

  it('rejects when no image (or more than one) is marked as cover', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    try {
      await useCase.execute(
        buildRequest({ images: [buildImage({ isCover: false })] }) as never,
      );
      expect.fail('Expected execute() to throw InvalidTurfImageError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidTurfImageError);
    }

    try {
      await useCase.execute(
        buildRequest({
          images: [buildImage({ isCover: true }), buildImage({ isCover: true })],
        }) as never,
      );
      expect.fail('Expected execute() to throw InvalidTurfImageError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidTurfImageError);
    }
  });

  it('rejects an invalid image file type', async () => {
    const applicationRepository = new FakeTurfOwnerApplicationRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new SubmitTurfOwnerApplicationUseCase(
      applicationRepository,
      fileStorageService,
      new FakeLocationLookupService(),
    );

    try {
      await useCase.execute(
        buildRequest({ images: [buildImage({ mimeType: 'application/pdf' })] }) as never,
      );
      expect.fail('Expected execute() to throw InvalidTurfImageError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidTurfImageError);
    }
  });
});
