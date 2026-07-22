import { expect } from 'chai';
import { ChangePasswordUseCase } from '../../../src/application/user/use-cases/ChangePasswordUseCase.js';
import { CurrentPasswordIncorrectError } from '../../../src/domain/user/errors/CurrentPasswordIncorrectError.js';
import { PasswordNotSetError } from '../../../src/domain/user/errors/PasswordNotSetError.js';
import { WeakPasswordError } from '../../../src/domain/user/errors/WeakPasswordError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { buildGoogleOnlyUser, buildPersistedUser } from '../../fixtures/users.fixture.js';

describe('ChangePasswordUseCase', () => {
  it('verifies the current password and persists the new hash', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new ChangePasswordUseCase(userRepository, new FakePasswordHasher(true));

    const result = await useCase.execute({
      userId: 'user_1',
      currentPassword: 'password1',
      newPassword: 'newPassword1',
    });

    expect(result.message).to.equal('Password changed successfully.');
    expect(userRepository.updatePasswordCalls).to.have.length(1);
    expect(userRepository.updatePasswordCalls[0]?.userId).to.equal('user_1');
  });

  it('throws CurrentPasswordIncorrectError when the current password does not match', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new ChangePasswordUseCase(userRepository, new FakePasswordHasher(false));

    try {
      await useCase.execute({
        userId: 'user_1',
        currentPassword: 'wrong-password',
        newPassword: 'newPassword1',
      });
      expect.fail(
        'Expected execute() to throw CurrentPasswordIncorrectError, but it did not throw.',
      );
    } catch (error) {
      expect(error).to.be.instanceOf(CurrentPasswordIncorrectError);
    }
    expect(userRepository.updatePasswordCalls).to.have.length(0);
  });

  it('throws PasswordNotSetError for a Google-only account with no password on file', async () => {
    const user = buildGoogleOnlyUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new ChangePasswordUseCase(userRepository, new FakePasswordHasher(true));

    try {
      await useCase.execute({
        userId: 'user_1',
        currentPassword: 'anything',
        newPassword: 'newPassword1',
      });
      expect.fail('Expected execute() to throw PasswordNotSetError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(PasswordNotSetError);
    }
  });

  it('throws WeakPasswordError for a new password that fails validation', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new ChangePasswordUseCase(userRepository, new FakePasswordHasher(true));

    try {
      await useCase.execute({
        userId: 'user_1',
        currentPassword: 'password1',
        newPassword: 'short',
      });
      expect.fail('Expected execute() to throw WeakPasswordError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(WeakPasswordError);
    }
  });
});
