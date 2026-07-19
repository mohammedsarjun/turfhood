import { expect } from 'chai';
import { LoginWithGoogleUseCase } from '../../../src/application/user/use-cases/LoginWithGoogleUseCase.js';
import { AccountSuspendedError } from '../../../src/domain/user/errors/AccountSuspendedError.js';
import { GoogleTokenInvalidError } from '../../../src/domain/user/errors/GoogleTokenInvalidError.js';
import { GoogleEmailNotVerifiedError } from '../../../src/domain/user/errors/GoogleEmailNotVerifiedError.js';
import { User } from '../../../src/domain/user/entities/User.js';
import { Email } from '../../../src/domain/user/value-objects/Email.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeGoogleAuthService } from '../../mocks/FakeGoogleAuthService.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';
import type { GoogleProfile } from '../../../src/domain/user/services/IGoogleAuthService.js';

function buildTokenService(): JwtTokenService {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-only-secret';
  return new JwtTokenService();
}

const validProfile: GoogleProfile = {
  googleId: 'google_123',
  email: 'jordan@example.com',
  name: 'Jordan Lee',
  avatarUrl: 'https://example.com/avatar.png',
  emailVerified: true,
};

function buildUserWithStatus(
  status: 'active' | 'suspended' | 'deleted',
  overrides: { googleId?: string } = {},
): User {
  return User.fromPersistence({
    id: 'user_1',
    name: 'Jordan Lee',
    email: Email.create('jordan@example.com'),
    passwordHash: 'hashed-password1',
    authProviders: overrides.googleId ? ['email', 'google'] : ['email'],
    roles: ['customer'],
    isVerified: true,
    status,
    ...(overrides.googleId ? { googleId: overrides.googleId } : {}),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

describe('LoginWithGoogleUseCase', () => {
  // HAPPY PATH: no existing user for this email — a brand-new, pre-verified user is created.
  it('creates a new verified user with a googleId when no account exists for the email', async () => {
    const userRepository = new FakeUserRepository({ existingUserByEmail: null });
    const useCase = new LoginWithGoogleUseCase(
      userRepository,
      new FakeGoogleAuthService(validProfile),
      buildTokenService(),
    );

    const result = await useCase.execute({ code: 'auth-code' });

    expect(result.user.email).to.equal('jordan@example.com');
    expect(result.user.isVerified).to.equal(true);
    expect(result.accessToken).to.be.a('string').that.is.not.empty;
    expect(userRepository.createCalls).to.have.length(1);
    expect(userRepository.createCalls[0]?.googleId).to.equal('google_123');
    expect(userRepository.createCalls[0]?.isVerified).to.equal(true);
    expect(userRepository.linkGoogleAccountCalls).to.have.length(0);
  });

  // Account-linking: an existing email/password user signs in with Google using the same
  // email — the Google id is linked to the existing record instead of creating a duplicate.
  it('links the Google account to an existing user instead of creating a duplicate', async () => {
    const existingUser = buildUserWithStatus('active');
    const userRepository = new FakeUserRepository({
      existingUserByEmail: existingUser,
      existingUserById: existingUser,
    });
    const useCase = new LoginWithGoogleUseCase(
      userRepository,
      new FakeGoogleAuthService(validProfile),
      buildTokenService(),
    );

    const result = await useCase.execute({ code: 'auth-code' });

    expect(userRepository.createCalls).to.have.length(0);
    expect(userRepository.linkGoogleAccountCalls).to.deep.equal([
      { userId: 'user_1', googleId: 'google_123', avatarUrl: 'https://example.com/avatar.png' },
    ]);
    expect(result.accessToken).to.be.a('string').that.is.not.empty;
  });

  // A user already linked to this Google account doesn't get re-linked on every login.
  it('does not re-link an account that already has this googleId', async () => {
    const linkedUser = buildUserWithStatus('active', { googleId: 'google_123' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: linkedUser });
    const useCase = new LoginWithGoogleUseCase(
      userRepository,
      new FakeGoogleAuthService(validProfile),
      buildTokenService(),
    );

    await useCase.execute({ code: 'auth-code' });

    expect(userRepository.linkGoogleAccountCalls).to.have.length(0);
    expect(userRepository.createCalls).to.have.length(0);
  });

  // ERROR CASE: a suspended account must still be rejected, Google auth or not.
  it('throws AccountSuspendedError for a suspended user', async () => {
    const suspendedUser = buildUserWithStatus('suspended', { googleId: 'google_123' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: suspendedUser });
    const useCase = new LoginWithGoogleUseCase(
      userRepository,
      new FakeGoogleAuthService(validProfile),
      buildTokenService(),
    );

    try {
      await useCase.execute({ code: 'auth-code' });
      expect.fail('Expected execute() to throw AccountSuspendedError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(AccountSuspendedError);
    }
  });

  // ERROR CASE: an invalid/expired authorization code must not authenticate anyone.
  it('propagates GoogleTokenInvalidError when the code fails verification', async () => {
    const userRepository = new FakeUserRepository();
    const useCase = new LoginWithGoogleUseCase(
      userRepository,
      new FakeGoogleAuthService(null),
      buildTokenService(),
    );

    try {
      await useCase.execute({ code: 'bad-code' });
      expect.fail('Expected execute() to throw GoogleTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(GoogleTokenInvalidError);
    }
  });

  // ERROR CASE: Google reports the profile's email as unverified — refuse to trust it.
  it('throws GoogleEmailNotVerifiedError when the Google profile email is unverified', async () => {
    const userRepository = new FakeUserRepository();
    const unverifiedProfile: GoogleProfile = { ...validProfile, emailVerified: false };
    const useCase = new LoginWithGoogleUseCase(
      userRepository,
      new FakeGoogleAuthService(unverifiedProfile),
      buildTokenService(),
    );

    try {
      await useCase.execute({ code: 'auth-code' });
      expect.fail('Expected execute() to throw GoogleEmailNotVerifiedError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(GoogleEmailNotVerifiedError);
    }
  });
});
