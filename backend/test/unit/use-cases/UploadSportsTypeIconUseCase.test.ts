import { expect } from 'chai';
import { UploadSportsTypeIconUseCase } from '../../../src/application/sportsType/use-cases/UploadSportsTypeIconUseCase.js';
import { InvalidSportsTypeIconFileError } from '../../../src/domain/sportsType/errors/InvalidSportsTypeIconFileError.js';
import { SportsTypeNotFoundError } from '../../../src/domain/sportsType/errors/SportsTypeNotFoundError.js';
import { FakeSportsTypeRepository } from '../../mocks/FakeSportsTypeRepository.js';
import { FakeFileStorageService } from '../../mocks/FakeFileStorageService.js';
import { buildSportsType } from '../../fixtures/sportsTypes.fixture.js';

function buildRequest(overrides: { mimeType?: string; sizeBytes?: number } = {}) {
  return {
    id: 'sport_1',
    buffer: Buffer.from('fake-image-bytes'),
    filename: 'icon.png',
    mimeType: overrides.mimeType ?? 'image/png',
    sizeBytes: overrides.sizeBytes ?? 1024,
  };
}

describe('UploadSportsTypeIconUseCase', () => {
  it('uploads a valid image and persists its URL on the sport', async () => {
    const existing = buildSportsType({ id: 'sport_1' });
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/icon.png' });
    const useCase = new UploadSportsTypeIconUseCase(sportsTypeRepository, fileStorageService);

    await useCase.execute(buildRequest());

    expect(fileStorageService.uploadCalls).to.have.length(1);
    expect(sportsTypeRepository.updateCalls).to.deep.equal([
      { id: 'sport_1', changes: { icon: 'http://cdn.test/icon.png' } },
    ]);
  });

  it('deletes the previous icon after a successful upload', async () => {
    const existing = buildSportsType({ id: 'sport_1', icon: 'http://cdn.test/old.png' });
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/new.png' });
    const useCase = new UploadSportsTypeIconUseCase(sportsTypeRepository, fileStorageService);

    await useCase.execute(buildRequest());

    expect(fileStorageService.deleteCalls).to.deep.equal(['http://cdn.test/old.png']);
  });

  it('rejects a disallowed file type before touching storage', async () => {
    const existing = buildSportsType({ id: 'sport_1' });
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UploadSportsTypeIconUseCase(sportsTypeRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ mimeType: 'application/pdf' }));
      expect.fail('Expected execute() to throw InvalidSportsTypeIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidSportsTypeIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('rejects a file over the size limit before touching storage', async () => {
    const existing = buildSportsType({ id: 'sport_1' });
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: existing });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UploadSportsTypeIconUseCase(sportsTypeRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ sizeBytes: 6 * 1024 * 1024 }));
      expect.fail('Expected execute() to throw InvalidSportsTypeIconFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidSportsTypeIconFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('throws SportsTypeNotFoundError when the sport no longer exists', async () => {
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: null });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UploadSportsTypeIconUseCase(sportsTypeRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest());
      expect.fail('Expected execute() to throw SportsTypeNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(SportsTypeNotFoundError);
    }
  });
});
