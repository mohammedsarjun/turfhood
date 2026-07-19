import { expect } from 'chai';
import { SetPasswordUseCase } from '../../../src/application/user/use-cases/SetPasswordUseCase.js';
import { PasswordAlreadySetError } from '../../../src/domain/user/errors/PasswordAlreadySetError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { buildGoogleOnlyUser, buildPersistedUser } from '../../fixtures/users.fixture.js';

describe('SetPasswordUseCase', () => {
  it('sets a password and adds email to authProviders for a Google-only account', async () => {
    const user = buildGoogleOnlyUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new SetPasswordUseCase(userRepository, new FakePasswordHasher());

    const result = await useCase.execute({ userId: 'user_1', newPassword: 'newPassword1' });

    expect(result.message).to.include('Password set successfully');
    expect(result.user.id).to.equal('user_1');
    expect(userRepository.addPasswordAuthCalls).to.have.length(1);
    expect(userRepository.addPasswordAuthCalls[0]?.userId).to.equal('user_1');
  });

  it('throws PasswordAlreadySetError when the account already has a password', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new SetPasswordUseCase(userRepository, new FakePasswordHasher());

    try {
      await useCase.execute({ userId: 'user_1', newPassword: 'newPassword1' });
      expect.fail('Expected execute() to throw PasswordAlreadySetError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(PasswordAlreadySetError);
    }
    expect(userRepository.addPasswordAuthCalls).to.have.length(0);
  });
});
