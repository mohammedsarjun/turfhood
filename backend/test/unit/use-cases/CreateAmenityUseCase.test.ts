import { expect } from 'chai';
import { CreateAmenityUseCase } from '../../../src/application/amenity/use-cases/CreateAmenityUseCase.js';
import { DuplicateAmenityNameError } from '../../../src/domain/amenity/errors/DuplicateAmenityNameError.js';
import { InvalidAmenityIconFileError } from '../../../src/domain/amenity/errors/InvalidAmenityIconFileError.js';
import { FakeAmenityRepository } from '../../mocks/FakeAmenityRepository.js';
import { FakeFileStorageService } from '../../mocks/FakeFileStorageService.js';

function buildRequest(overrides: { name?: string; mimeType?: string; sizeBytes?: number } = {}) {
  return {
    name: overrides.name ?? 'Floodlights',
    iconBuffer: Buffer.from('fake-image-bytes'),
    iconFilename: 'icon.png',
    iconMimeType: overrides.mimeType ?? 'image/png',
    iconSizeBytes: overrides.sizeBytes ?? 1024,
  };
}

describe('CreateAmenityUseCase', () => {
  it('trims the name, uploads the icon, and persists a new, listed amenity', async () => {
    const amenityRepository = new FakeAmenityRepository();
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/icon.png' });
    const useCase = new CreateAmenityUseCase(amenityRepository, fileStorageService);

    const result = await useCase.execute(buildRequest({ name: '  Floodlights  ' }));

    expect(fileStorageService.uploadCalls).to.have.length(1);
    expect(amenityRepository.createCalls).to.have.length(1);
    expect(amenityRepository.createCalls[0]?.name).to.equal('Floodlights');
    expect(amenityRepository.createCalls[0]?.icon).to.equal('http://cdn.test/icon.png');
    expect(result.isListed).to.equal(true);
  });

  it('rejects a disallowed file type before touching storage', async () => {
    const amenityRepository = new FakeAmenityRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new CreateAmenityUseCase(amenityRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ mimeType: 'application/pdf' }));
      expect.fail('Expected execute() to throw InvalidAmenityIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAmenityIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('rejects a file over the size limit before touching storage', async () => {
    const amenityRepository = new FakeAmenityRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new CreateAmenityUseCase(amenityRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ sizeBytes: 6 * 1024 * 1024 }));
      expect.fail('Expected execute() to throw InvalidAmenityIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAmenityIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('propagates DuplicateAmenityNameError thrown by the repository', async () => {
    class DuplicateThrowingRepository extends FakeAmenityRepository {
      override async create(): Promise<never> {
        throw new DuplicateAmenityNameError('Floodlights');
      }
    }
    const fileStorageService = new FakeFileStorageService();
    const useCase = new CreateAmenityUseCase(new DuplicateThrowingRepository(), fileStorageService);

    try {
      await useCase.execute(buildRequest());
      expect.fail('Expected execute() to throw DuplicateAmenityNameError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(DuplicateAmenityNameError);
    }
  });
});
