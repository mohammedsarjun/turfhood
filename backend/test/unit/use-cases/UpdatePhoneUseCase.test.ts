import { expect } from 'chai';
import { UpdatePhoneUseCase } from '../../../src/application/user/use-cases/UpdatePhoneUseCase.js';
import { DuplicatePhoneError } from '../../../src/domain/user/errors/DuplicatePhoneError.js';
import { InvalidPhoneError } from '../../../src/domain/user/errors/InvalidPhoneError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { buildPersistedUser } from '../../fixtures/users.fixture.js';

describe('UpdatePhoneUseCase', () => {
  it('validates the format and persists the new phone number', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new UpdatePhoneUseCase(userRepository);

    const result = await useCase.execute({ userId: 'user_1', phone: '9876543210' });

    expect(userRepository.updatePhoneCalls).to.deep.equal([
      { userId: 'user_1', phone: '9876543210' },
    ]);
    expect(result.id).to.equal('user_1');
  });

  it('throws InvalidPhoneError for a malformed phone number', async () => {
    const userRepository = new FakeUserRepository();
    const useCase = new UpdatePhoneUseCase(userRepository);

    try {
      await useCase.execute({ userId: 'user_1', phone: 'not-a-phone' });
      expect.fail('Expected execute() to throw InvalidPhoneError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidPhoneError);
    }
  });

  it('throws DuplicatePhoneError when another user already has this phone number', async () => {
    const otherUser = buildPersistedUser({ id: 'user_2', phone: '9876543210' });
    const userRepository = new FakeUserRepository({ existingUserByPhone: otherUser });
    const useCase = new UpdatePhoneUseCase(userRepository);

    try {
      await useCase.execute({ userId: 'user_1', phone: '9876543210' });
      expect.fail('Expected execute() to throw DuplicatePhoneError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(DuplicatePhoneError);
    }
  });
});
