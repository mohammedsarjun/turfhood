import { expect } from 'chai';
import { UpdateAvatarUseCase } from '../../../src/application/user/use-cases/UpdateAvatarUseCase.js';
import { InvalidAvatarFileError } from '../../../src/domain/user/errors/InvalidAvatarFileError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeFileStorageService } from '../../mocks/FakeFileStorageService.js';
import { buildPersistedUser } from '../../fixtures/users.fixture.js';

function buildRequest(overrides: { mimeType?: string; sizeBytes?: number } = {}) {
  return {
    userId: 'user_1',
    buffer: Buffer.from('fake-image-bytes'),
    filename: 'avatar.png',
    mimeType: overrides.mimeType ?? 'image/png',
    sizeBytes: overrides.sizeBytes ?? 1024,
  };
}

describe('UpdateAvatarUseCase', () => {
  it('uploads a valid image and persists its URL', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/avatar.png' });
    const useCase = new UpdateAvatarUseCase(userRepository, fileStorageService);

    await useCase.execute(buildRequest());

    expect(fileStorageService.uploadCalls).to.have.length(1);
    expect(userRepository.updateAvatarUrlCalls).to.deep.equal([
      { userId: 'user_1', avatarUrl: 'http://cdn.test/avatar.png' },
    ]);
  });

  it('deletes the previous avatar after a successful upload', async () => {
    const user = buildPersistedUser({ id: 'user_1', avatarUrl: 'http://cdn.test/old.png' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const fileStorageService = new FakeFileStorageService({ url: 'http://cdn.test/new.png' });
    const useCase = new UpdateAvatarUseCase(userRepository, fileStorageService);

    await useCase.execute(buildRequest());

    expect(fileStorageService.deleteCalls).to.deep.equal(['http://cdn.test/old.png']);
  });

  it('rejects a disallowed file type before touching storage', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UpdateAvatarUseCase(userRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ mimeType: 'application/pdf' }));
      expect.fail('Expected execute() to throw InvalidAvatarFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAvatarFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });

  it('rejects a file over the size limit before touching storage', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const fileStorageService = new FakeFileStorageService();
    const useCase = new UpdateAvatarUseCase(userRepository, fileStorageService);

    try {
      await useCase.execute(buildRequest({ sizeBytes: 6 * 1024 * 1024 }));
      expect.fail('Expected execute() to throw InvalidAvatarFileError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAvatarFileError);
    }
    expect(fileStorageService.uploadCalls).to.have.length(0);
  });
});
