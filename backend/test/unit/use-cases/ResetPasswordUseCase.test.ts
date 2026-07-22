import { expect } from 'chai';
import { ResetPasswordUseCase } from '../../../src/application/passwordReset/use-cases/ResetPasswordUseCase.js';
import { ResetTokenAlreadyUsedError } from '../../../src/domain/passwordReset/errors/ResetTokenAlreadyUsedError.js';
import { ResetTokenExpiredError } from '../../../src/domain/passwordReset/errors/ResetTokenExpiredError.js';
import { ResetTokenInvalidError } from '../../../src/domain/passwordReset/errors/ResetTokenInvalidError.js';
import { WeakPasswordError } from '../../../src/domain/user/errors/WeakPasswordError.js';
import { PasswordResetTokenService } from '../../../src/infrastructure/passwordReset/services/PasswordResetTokenService.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordResetTokenRepository } from '../../mocks/FakePasswordResetTokenRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import {
  buildPasswordResetToken,
  validRawToken,
  validTokenHash,
} from '../../fixtures/passwordReset.fixture.js';

function buildTokenService(): PasswordResetTokenService {
  return new PasswordResetTokenService();
}

describe('ResetPasswordUseCase', () => {
  // HAPPY PATH: valid, unconsumed, unexpired token + a strong password
  // updates the user's password and consumes the token (and any siblings).
  it('updates the password, consumes the token, and invalidates other tokens for the user', async () => {
    const tokenRepository = new FakePasswordResetTokenRepository();
    tokenRepository.seed(
      buildPasswordResetToken({ id: 'reset_1', userId: 'user_1', tokenHash: validTokenHash }),
    );
    const userRepository = new FakeUserRepository();
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      buildTokenService(),
      userRepository,
      new FakePasswordHasher(),
    );

    const result = await useCase.execute({ token: validRawToken, newPassword: 'newPassword1' });

    expect(result).to.deep.equal({ message: 'Password has been reset successfully.' });
    expect(userRepository.updatePasswordCalls).to.have.length(1);
    expect(userRepository.updatePasswordCalls[0]?.userId).to.equal('user_1');
    expect(tokenRepository.invalidateAllForUserCalls).to.deep.equal(['user_1']);

    const consumedRecord = await tokenRepository.findByTokenHash(validTokenHash);
    expect(consumedRecord?.isConsumed()).to.equal(true);
  });

  // ERROR CASE: no record matches the submitted token's hash at all.
  it('throws ResetTokenInvalidError when no record matches the token', async () => {
    const useCase = new ResetPasswordUseCase(
      new FakePasswordResetTokenRepository(),
      buildTokenService(),
      new FakeUserRepository(),
      new FakePasswordHasher(),
    );

    try {
      await useCase.execute({ token: validRawToken, newPassword: 'newPassword1' });
      expect.fail('Expected execute() to throw ResetTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(ResetTokenInvalidError);
    }
  });

  // ERROR CASE: the token was already consumed by an earlier reset.
  it('throws ResetTokenAlreadyUsedError when the token has already been consumed', async () => {
    const tokenRepository = new FakePasswordResetTokenRepository();
    tokenRepository.seed(
      buildPasswordResetToken({ tokenHash: validTokenHash, consumedAt: new Date('2026-01-01') }),
    );
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      buildTokenService(),
      new FakeUserRepository(),
      new FakePasswordHasher(),
    );

    try {
      await useCase.execute({ token: validRawToken, newPassword: 'newPassword1' });
      expect.fail('Expected execute() to throw ResetTokenAlreadyUsedError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(ResetTokenAlreadyUsedError);
    }
  });

  // ERROR CASE: the token's expiresAt is in the past.
  it('throws ResetTokenExpiredError once now is past expiresAt', async () => {
    const tokenRepository = new FakePasswordResetTokenRepository();
    tokenRepository.seed(
      buildPasswordResetToken({
        tokenHash: validTokenHash,
        expiresAt: new Date(Date.now() - 1000),
      }),
    );
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      buildTokenService(),
      new FakeUserRepository(),
      new FakePasswordHasher(),
    );

    try {
      await useCase.execute({ token: validRawToken, newPassword: 'newPassword1' });
      expect.fail('Expected execute() to throw ResetTokenExpiredError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(ResetTokenExpiredError);
    }
  });

  // REGRESSION: a weak new password must still be rejected, even with a valid token.
  it('throws WeakPasswordError for a password that fails Password.create validation', async () => {
    const tokenRepository = new FakePasswordResetTokenRepository();
    tokenRepository.seed(buildPasswordResetToken({ tokenHash: validTokenHash }));
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      buildTokenService(),
      new FakeUserRepository(),
      new FakePasswordHasher(),
    );

    try {
      await useCase.execute({ token: validRawToken, newPassword: 'short' });
      expect.fail('Expected execute() to throw WeakPasswordError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(WeakPasswordError);
    }
  });
});
