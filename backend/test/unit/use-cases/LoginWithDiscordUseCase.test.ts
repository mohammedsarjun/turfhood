import { expect } from 'chai';
import { LoginWithDiscordUseCase } from '../../../src/application/user/use-cases/LoginWithDiscordUseCase.js';
import { AccountSuspendedError } from '../../../src/domain/user/errors/AccountSuspendedError.js';
import { DiscordTokenInvalidError } from '../../../src/domain/user/errors/DiscordTokenInvalidError.js';
import { DiscordEmailNotVerifiedError } from '../../../src/domain/user/errors/DiscordEmailNotVerifiedError.js';
import { User } from '../../../src/domain/user/entities/User.js';
import { Email } from '../../../src/domain/user/value-objects/Email.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeDiscordAuthService } from '../../mocks/FakeDiscordAuthService.js';
import { FakeRefreshTokenRepository } from '../../mocks/FakeRefreshTokenRepository.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';
import { JwtRefreshTokenService } from '../../../src/infrastructure/refreshToken/services/JwtRefreshTokenService.js';
import type { DiscordProfile } from '../../../src/domain/user/services/IDiscordAuthService.js';

function buildTokenService(): JwtTokenService {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-only-secret';
  return new JwtTokenService();
}

function buildRefreshTokenService(): JwtRefreshTokenService {
  process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'test-only-refresh-secret';
  return new JwtRefreshTokenService();
}

const validProfile: DiscordProfile = {
  discordId: 'discord_123',
  email: 'alex@example.com',
  name: 'Alex Morgan',
  avatarUrl: 'https://cdn.discordapp.com/avatars/discord_123/avatar.png',
  emailVerified: true,
};

function buildUserWithStatus(
  status: 'active' | 'suspended' | 'deleted',
  overrides: { discordId?: string } = {},
): User {
  return User.fromPersistence({
    id: 'user_1',
    name: 'Alex Morgan',
    email: Email.create('alex@example.com'),
    passwordHash: 'hashed-password1',
    authProviders: overrides.discordId ? ['email', 'discord'] : ['email'],
    roles: ['customer'],
    isVerified: true,
    status,
    ...(overrides.discordId ? { discordId: overrides.discordId } : {}),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

describe('LoginWithDiscordUseCase', () => {
  // HAPPY PATH: no existing user for this email — a brand-new, pre-verified user is created.
  it('creates a new verified user with a discordId when no account exists for the email', async () => {
    const userRepository = new FakeUserRepository({ existingUserByEmail: null });
    const useCase = new LoginWithDiscordUseCase(
      userRepository,
      new FakeDiscordAuthService(validProfile),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    const result = await useCase.execute({ code: 'auth-code' });

    expect(result.user.email).to.equal('alex@example.com');
    expect(result.user.isVerified).to.equal(true);
    expect(result.accessToken).to.be.a('string').that.is.not.empty;
    expect(userRepository.createCalls).to.have.length(1);
    expect(userRepository.createCalls[0]?.discordId).to.equal('discord_123');
    expect(userRepository.createCalls[0]?.isVerified).to.equal(true);
    expect(userRepository.linkDiscordAccountCalls).to.have.length(0);
  });

  // Account-linking: an existing email/password user signs in with Discord using the same email
  it('links the Discord account to an existing user instead of creating a duplicate', async () => {
    const existingUser = buildUserWithStatus('active');
    const userRepository = new FakeUserRepository({
      existingUserByEmail: existingUser,
      existingUserById: existingUser,
    });
    const useCase = new LoginWithDiscordUseCase(
      userRepository,
      new FakeDiscordAuthService(validProfile),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    const result = await useCase.execute({ code: 'auth-code' });

    expect(userRepository.createCalls).to.have.length(0);
    expect(userRepository.linkDiscordAccountCalls).to.deep.equal([
      {
        userId: 'user_1',
        discordId: 'discord_123',
        avatarUrl: 'https://cdn.discordapp.com/avatars/discord_123/avatar.png',
      },
    ]);
    expect(result.accessToken).to.be.a('string').that.is.not.empty;
  });

  // A user already linked to this Discord account doesn't get re-linked on every login.
  it('does not re-link an account that already has this discordId', async () => {
    const linkedUser = buildUserWithStatus('active', { discordId: 'discord_123' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: linkedUser });
    const useCase = new LoginWithDiscordUseCase(
      userRepository,
      new FakeDiscordAuthService(validProfile),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    await useCase.execute({ code: 'auth-code' });

    expect(userRepository.linkDiscordAccountCalls).to.have.length(0);
    expect(userRepository.createCalls).to.have.length(0);
  });

  // ERROR CASE: a suspended account must be rejected.
  it('throws AccountSuspendedError for a suspended user', async () => {
    const suspendedUser = buildUserWithStatus('suspended', { discordId: 'discord_123' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: suspendedUser });
    const useCase = new LoginWithDiscordUseCase(
      userRepository,
      new FakeDiscordAuthService(validProfile),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ code: 'auth-code' });
      expect.fail('Expected execute() to throw AccountSuspendedError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(AccountSuspendedError);
    }
  });

  // ERROR CASE: an invalid/expired authorization code must not authenticate anyone.
  it('propagates DiscordTokenInvalidError when the code fails verification', async () => {
    const userRepository = new FakeUserRepository();
    const useCase = new LoginWithDiscordUseCase(
      userRepository,
      new FakeDiscordAuthService(null),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ code: 'bad-code' });
      expect.fail('Expected execute() to throw DiscordTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(DiscordTokenInvalidError);
    }
  });

  // ERROR CASE: Discord reports the profile's email as unverified — refuse to trust it.
  it('throws DiscordEmailNotVerifiedError when the Discord profile email is unverified', async () => {
    const userRepository = new FakeUserRepository();
    const unverifiedProfile: DiscordProfile = { ...validProfile, emailVerified: false };
    const useCase = new LoginWithDiscordUseCase(
      userRepository,
      new FakeDiscordAuthService(unverifiedProfile),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ code: 'auth-code' });
      expect.fail(
        'Expected execute() to throw DiscordEmailNotVerifiedError, but it did not throw.',
      );
    } catch (error) {
      expect(error).to.be.instanceOf(DiscordEmailNotVerifiedError);
    }
  });
});
