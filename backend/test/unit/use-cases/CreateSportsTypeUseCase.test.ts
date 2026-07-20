import { expect } from 'chai';
import { CreateSportsTypeUseCase } from '../../../src/application/sportsType/use-cases/CreateSportsTypeUseCase.js';
import { DuplicateSportsTypeNameError } from '../../../src/domain/sportsType/errors/DuplicateSportsTypeNameError.js';
import { InvalidSportsTypeIconFileError } from '../../../src/domain/sportsType/errors/InvalidSportsTypeIconFileError.js';
import { FakeSportsTypeRepository } from '../../mocks/FakeSportsTypeRepository.js';
import { FakeFileStorageService } from '../../mocks/FakeFileStorageService.js';

function buildRequest(overrides: { name?: string; mimeType?: string; sizeBytes?: number } = {}) {
  return {
    name: overrides.name ?? 'Football',
    iconBuffer: Buffer.from('fake-image-bytes'),
    iconFilename: 'icon.png',
    iconMimeType: overrides.mimeType ?? 'image/png',
    iconSizeBytes: overrides.sizeBytes ?? 1024,
  };
}

describe('CreateSportsTypeUseCase', () => {
  it('trims the name, uploads the icon, and persists a new, listed sport', async () => {
    const sportsTypeRepository = new FakeSportsTypeRepository();
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/icon.png' });
    const useCase = new CreateSportsTypeUseCase(sportsTypeRepository, fileStorageService);

    const result = await useCase.execute(buildRequest({ name: '  Football  ' }));

    expect(fileStorageService.uploadCalls).to.have.length(1);
    expect(sportsTypeRepository.createCalls).to.have.length(1);
    expect(sportsTypeRepository.createCalls[0]?.name).to.equal('Football');
    expect(sportsTypeRepository.createCalls[0]?.icon).to.equal('http://cdn.test/icon.png');
    expect(result.isListed).to.equal(true);
  });

  it('rejects a disallowed file type before touching storage', async () => {
    const sportsTypeRepository = new FakeSportsTypeRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new CreateSportsTypeUseCase(sportsTypeRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ mimeType: 'application/pdf' }));
      expect.fail('Expected execute() to throw InvalidSportsTypeIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidSportsTypeIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('rejects a file over the size limit before touching storage', async () => {
    const sportsTypeRepository = new FakeSportsTypeRepository();
    const fileStorageService = new FakeFileStorageService();
    const useCase = new CreateSportsTypeUseCase(sportsTypeRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ sizeBytes: 6 * 1024 * 1024 }));
      expect.fail('Expected execute() to throw InvalidSportsTypeIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidSportsTypeIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('propagates DuplicateSportsTypeNameError thrown by the repository', async () => {
    class DuplicateThrowingRepository extends FakeSportsTypeRepository {
      override async create(): Promise<never> {
        throw new DuplicateSportsTypeNameError('Football');
      }
    }
    const fileStorageService = new FakeFileStorageService();
    const useCase = new CreateSportsTypeUseCase(new DuplicateThrowingRepository(), fileStorageService);

    try {
      await useCase.execute(buildRequest());
      expect.fail(
        'Expected execute() to throw DuplicateSportsTypeNameError, but it did not throw.',
      );
    } catch (error) {
      expect(error).to.be.instanceOf(DuplicateSportsTypeNameError);
    }
  });
});
