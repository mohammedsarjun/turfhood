import { expect } from 'chai';
import { UploadAmenityIconUseCase } from '../../../src/application/amenity/use-cases/UploadAmenityIconUseCase.js';
import { InvalidAmenityIconFileError } from '../../../src/domain/amenity/errors/InvalidAmenityIconFileError.js';
import { AmenityNotFoundError } from '../../../src/domain/amenity/errors/AmenityNotFoundError.js';
import { FakeAmenityRepository } from '../../mocks/FakeAmenityRepository.js';
import { FakeFileStorageService } from '../../mocks/FakeFileStorageService.js';
import { buildAmenity } from '../../fixtures/amenities.fixture.js';

function buildRequest(overrides: { mimeType?: string; sizeBytes?: number } = {}) {
  return {
    id: 'amenity_1',
    buffer: Buffer.from('fake-image-bytes'),
    filename: 'icon.png',
    mimeType: overrides.mimeType ?? 'image/png',
    sizeBytes: overrides.sizeBytes ?? 1024,
  };
}

describe('UploadAmenityIconUseCase', () => {
  it('uploads a valid image and persists its URL on the amenity', async () => {
    const existing = buildAmenity({ id: 'amenity_1' });
    const amenityRepository = new FakeAmenityRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/icon.png' });
    const useCase = new UploadAmenityIconUseCase(amenityRepository, fileStorageService);

    await useCase.execute(buildRequest());

    expect(fileStorageService.uploadCalls).to.have.length(1);
    expect(amenityRepository.updateCalls).to.deep.equal([
      { id: 'amenity_1', changes: { icon: 'http://cdn.test/icon.png' } },
    ]);
  });

  it('deletes the previous icon after a successful upload', async () => {
    const existing = buildAmenity({ id: 'amenity_1', icon: 'http://cdn.test/old.png' });
    const amenityRepository = new FakeAmenityRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/new.png' });
    const useCase = new UploadAmenityIconUseCase(amenityRepository, fileStorageService);

    await useCase.execute(buildRequest());

    expect(fileStorageService.deleteCalls).to.deep.equal(['http://cdn.test/old.png']);
  });

  it('rejects a disallowed file type before touching storage', async () => {
    const existing = buildAmenity({ id: 'amenity_1' });
    const amenityRepository = new FakeAmenityRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UploadAmenityIconUseCase(amenityRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ mimeType: 'application/pdf' }));
      expect.fail('Expected execute() to throw InvalidAmenityIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAmenityIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('rejects a file over the size limit before touching storage', async () => {
    const existing = buildAmenity({ id: 'amenity_1' });
    const amenityRepository = new FakeAmenityRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UploadAmenityIconUseCase(amenityRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ sizeBytes: 6 * 1024 * 1024 }));
      expect.fail('Expected execute() to throw InvalidAmenityIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAmenityIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('throws AmenityNotFoundError when the amenity no longer exists', async () => {
    const amenityRepository = new FakeAmenityRepository({ existingById: null });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UploadAmenityIconUseCase(amenityRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest());
      expect.fail('Expected execute() to throw AmenityNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(AmenityNotFoundError);
    }
  });
});
