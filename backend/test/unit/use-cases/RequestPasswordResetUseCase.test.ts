import { expect } from 'chai';
import { RequestPasswordResetUseCase } from '../../../src/application/passwordReset/use-cases/RequestPasswordResetUseCase.js';
import { PasswordResetTokenService } from '../../../src/infrastructure/passwordReset/services/PasswordResetTokenService.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordResetTokenRepository } from '../../mocks/FakePasswordResetTokenRepository.js';
import { FakeEmailService } from '../../mocks/FakeEmailService.js';
import { buildUnverifiedUser } from '../../fixtures/otp.fixture.js';

// Real service used (not faked) since it's pure crypto (no I/O) — same
// reasoning LoginUserUseCase.test.ts applies to the real JwtTokenService.
function buildTokenService(): PasswordResetTokenService {
  return new PasswordResetTokenService();
}

describe('RequestPasswordResetUseCase', () => {
  // HAPPY PATH: a registered user requests a reset — a token is generated,
  // persisted, and emailed, and the generic response is returned.
  it('creates a token, emails a reset link, and returns the generic message for a registered user', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const tokenRepository = new FakePasswordResetTokenRepository();
    const emailService = new FakeEmailService();
    const useCase = new RequestPasswordResetUseCase(
      userRepository,
      tokenRepository,
      buildTokenService(),
      emailService,
    );

    const result = await useCase.execute({ email: 'jordan@example.com' });

    expect(result).to.deep.equal({
      message: 'If an account exists for this email, a password reset link has been sent.',
    });
    expect(emailService.sentPasswordResetEmails).to.have.length(1);
    expect(emailService.sentPasswordResetEmails[0]?.to).to.equal('jordan@example.com');
    expect(emailService.sentPasswordResetEmails[0]?.resetLink).to.include(
      '/change-password?token=',
    );
  });

  // BRANCH UNDER TEST: no user enumeration — an unknown email must not create
  // a token or send an email, but must return the exact same generic message.
  it('takes no action and returns the same generic message for an unregistered email', async () => {
    const userRepository = new FakeUserRepository({ existingUserByEmail: null });
    const tokenRepository = new FakePasswordResetTokenRepository();
    const emailService = new FakeEmailService();
    const useCase = new RequestPasswordResetUseCase(
      userRepository,
      tokenRepository,
      buildTokenService(),
      emailService,
    );

    const result = await useCase.execute({ email: 'unknown@example.com' });

    expect(result).to.deep.equal({
      message: 'If an account exists for this email, a password reset link has been sent.',
    });
    expect(emailService.sentPasswordResetEmails).to.have.length(0);
    expect(tokenRepository.invalidateAllForUserCalls).to.have.length(0);
  });

  // REGRESSION: any prior active token for this user must be invalidated
  // before a new one is issued, same as OTP's resend-invalidation behavior.
  it('invalidates prior tokens for the user before issuing a new one', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com', id: 'user_42' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const tokenRepository = new FakePasswordResetTokenRepository();
    const emailService = new FakeEmailService();
    const useCase = new RequestPasswordResetUseCase(
      userRepository,
      tokenRepository,
      buildTokenService(),
      emailService,
    );

    await useCase.execute({ email: 'jordan@example.com' });

    expect(tokenRepository.invalidateAllForUserCalls).to.deep.equal(['user_42']);
  });
});
