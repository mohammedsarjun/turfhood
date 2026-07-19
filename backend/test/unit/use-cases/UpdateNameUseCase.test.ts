import { expect } from 'chai';
import { UpdateNameUseCase } from '../../../src/application/user/use-cases/UpdateNameUseCase.js';
import { UserNotFoundError } from '../../../src/domain/user/errors/UserNotFoundError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { buildPersistedUser } from '../../fixtures/users.fixture.js';

describe('UpdateNameUseCase', () => {
  it('trims and persists the new name, returning the updated profile', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new UpdateNameUseCase(userRepository);

    const result = await useCase.execute({ userId: 'user_1', name: '  New Name  ' });

    expect(userRepository.updateNameCalls).to.deep.equal([{ userId: 'user_1', name: 'New Name' }]);
    expect(result.id).to.equal('user_1');
  });

  it('throws UserNotFoundError when the user no longer exists', async () => {
    const userRepository = new FakeUserRepository({ existingUserById: null });
    const useCase = new UpdateNameUseCase(userRepository);

    try {
      await useCase.execute({ userId: 'missing', name: 'New Name' });
      expect.fail('Expected execute() to throw UserNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(UserNotFoundError);
    }
  });
});
