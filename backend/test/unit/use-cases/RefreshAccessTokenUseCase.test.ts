import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { RefreshAccessTokenUseCase } from '../../../src/application/refreshToken/use-cases/RefreshAccessTokenUseCase.js';
import { RefreshTokenInvalidError } from '../../../src/domain/refreshToken/errors/RefreshTokenInvalidError.js';
import { RefreshTokenExpiredError } from '../../../src/domain/refreshToken/errors/RefreshTokenExpiredError.js';
import { RefreshToken } from '../../../src/domain/refreshToken/entities/RefreshToken.js';
import { User } from '../../../src/domain/user/entities/User.js';
import { Email } from '../../../src/domain/user/value-objects/Email.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeRefreshTokenRepository } from '../../mocks/FakeRefreshTokenRepository.js';
import { buildPersistedUser } from '../../fixtures/users.fixture.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';
import { JwtRefreshTokenService } from '../../../src/infrastructure/refreshToken/services/JwtRefreshTokenService.js';

function buildSuspendedUser(): User {
  return User.fromPersistence({
    id: 'user_1',
    name: 'Jordan Lee',
    email: Email.create('jordan@example.com'),
    passwordHash: 'hashed-password1',
    authProviders: ['email'],
    roles: ['customer'],
    isVerified: true,
    status: 'suspended',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

function buildTokenService(): JwtTokenService {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-only-secret';
  return new JwtTokenService();
}

function buildRefreshTokenService(): JwtRefreshTokenService {
  process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'test-only-refresh-secret';
  return new JwtRefreshTokenService();
}

describe('RefreshAccessTokenUseCase', () => {
  // HAPPY PATH: a valid, active refresh token rotates — old jti revoked, new one issued.
  it('rotates the refresh token and issues a new access token', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const refreshTokenRepository = new FakeRefreshTokenRepository();
    const refreshTokenService = buildRefreshTokenService();
    const issued = refreshTokenService.generate({ userId: 'user_1', roles: ['customer'] });
    await refreshTokenRepository.create(
      RefreshToken.issue({ userId: 'user_1', jti: issued.jti, expiresAt: issued.expiresAt }),
    );
    const useCase = new RefreshAccessTokenUseCase(
      refreshTokenRepository,
      refreshTokenService,
      userRepository,
      buildTokenService(),
    );

    const result = await useCase.execute(issued.token);

    expect(result.accessToken).to.be.a('string').that.is.not.empty;
    expect(result.refreshToken).to.be.a('string').that.is.not.empty;
    expect(result.refreshToken).to.not.equal(issued.token);
    expect(result.roles).to.deep.equal(['customer']);

    const oldRecord = await refreshTokenRepository.findByJti(issued.jti);
    expect(oldRecord?.isRevoked()).to.equal(true);
    expect(refreshTokenRepository.revokeCalls).to.have.length(1);
    expect(refreshTokenRepository.revokeCalls[0]?.jti).to.equal(issued.jti);
  });

  // ERROR CASE: a well-formed but unknown jti (never issued, or already garbage-collected).
  it('throws RefreshTokenInvalidError and revokes all sessions when the jti is unknown', async () => {
    const refreshTokenRepository = new FakeRefreshTokenRepository();
    const refreshTokenService = buildRefreshTokenService();
    const issued = refreshTokenService.generate({ userId: 'user_1', roles: ['customer'] });
    const useCase = new RefreshAccessTokenUseCase(
      refreshTokenRepository,
      refreshTokenService,
      new FakeUserRepository(),
      buildTokenService(),
    );

    try {
      await useCase.execute(issued.token);
      expect.fail('Expected execute() to throw RefreshTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenInvalidError);
    }
    expect(refreshTokenRepository.revokeAllForUserCalls).to.deep.equal(['user_1']);
  });

  // ERROR CASE: reuse of an already-rotated (revoked) token — theft/replay signal.
  it('throws RefreshTokenInvalidError and revokes all sessions when the jti was already revoked', async () => {
    const refreshTokenRepository = new FakeRefreshTokenRepository();
    const refreshTokenService = buildRefreshTokenService();
    const issued = refreshTokenService.generate({ userId: 'user_1', roles: ['customer'] });
    await refreshTokenRepository.create(
      RefreshToken.issue({ userId: 'user_1', jti: issued.jti, expiresAt: issued.expiresAt }),
    );
    await refreshTokenRepository.revoke(issued.jti);
    const useCase = new RefreshAccessTokenUseCase(
      refreshTokenRepository,
      refreshTokenService,
      new FakeUserRepository(),
      buildTokenService(),
    );

    try {
      await useCase.execute(issued.token);
      expect.fail('Expected execute() to throw RefreshTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenInvalidError);
    }
    expect(refreshTokenRepository.revokeAllForUserCalls).to.deep.equal(['user_1']);
  });

  it('allows a concurrent refresh during the rotation grace period', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const refreshTokenRepository = new FakeRefreshTokenRepository();
    const refreshTokenService = buildRefreshTokenService();
    const issued = refreshTokenService.generate({ userId: 'user_1', roles: ['customer'] });
    refreshTokenRepository.seed(
      RefreshToken.fromPersistence({
        userId: 'user_1',
        jti: issued.jti,
        expiresAt: issued.expiresAt,
        revokedAt: new Date(),
        replacedByJti: 'first-replacement-jti',
      }),
    );
    const useCase = new RefreshAccessTokenUseCase(
      refreshTokenRepository,
      refreshTokenService,
      new FakeUserRepository({ existingUserById: user }),
      buildTokenService(),
    );

    const result = await useCase.execute(issued.token);

    expect(result.refreshToken).to.be.a('string').that.is.not.empty;
    expect(refreshTokenRepository.revokeCalls).to.have.length(0);
    expect(refreshTokenRepository.revokeAllForUserCalls).to.have.length(0);
  });

  it('rejects reuse after the rotation grace period', async () => {
    const refreshTokenRepository = new FakeRefreshTokenRepository();
    const refreshTokenService = buildRefreshTokenService();
    const issued = refreshTokenService.generate({ userId: 'user_1', roles: ['customer'] });
    refreshTokenRepository.seed(
      RefreshToken.fromPersistence({
        userId: 'user_1',
        jti: issued.jti,
        expiresAt: issued.expiresAt,
        revokedAt: new Date(Date.now() - 6_000),
        replacedByJti: 'old-replacement-jti',
      }),
    );
    const useCase = new RefreshAccessTokenUseCase(
      refreshTokenRepository,
      refreshTokenService,
      new FakeUserRepository(),
      buildTokenService(),
    );

    try {
      await useCase.execute(issued.token);
      expect.fail('Expected execute() to reject refresh-token reuse outside the grace period.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenInvalidError);
    }
    expect(refreshTokenRepository.revokeAllForUserCalls).to.deep.equal(['user_1']);
  });

  // ERROR CASE: the JWT itself is expired.
  it('throws RefreshTokenExpiredError for an expired refresh token', async () => {
    process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'test-only-refresh-secret';
    const refreshTokenService = buildRefreshTokenService();
    const expiredToken = jwt.sign(
      { userId: 'user_1', roles: ['customer'], jti: 'expired-jti' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: -10 },
    );
    const useCase = new RefreshAccessTokenUseCase(
      new FakeRefreshTokenRepository(),
      refreshTokenService,
      new FakeUserRepository(),
      buildTokenService(),
    );

    try {
      await useCase.execute(expiredToken);
      expect.fail('Expected execute() to throw RefreshTokenExpiredError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenExpiredError);
    }
  });

  // ERROR CASE: the user is no longer active (suspended/deleted since the token was issued).
  it('throws RefreshTokenInvalidError and revokes all sessions when the user is not active', async () => {
    const userRepository = new FakeUserRepository({ existingUserById: buildSuspendedUser() });
    const refreshTokenRepository = new FakeRefreshTokenRepository();
    const refreshTokenService = buildRefreshTokenService();
    const issued = refreshTokenService.generate({ userId: 'user_1', roles: ['customer'] });
    await refreshTokenRepository.create(
      RefreshToken.issue({ userId: 'user_1', jti: issued.jti, expiresAt: issued.expiresAt }),
    );
    const useCase = new RefreshAccessTokenUseCase(
      refreshTokenRepository,
      refreshTokenService,
      userRepository,
      buildTokenService(),
    );

    try {
      await useCase.execute(issued.token);
      expect.fail('Expected execute() to throw RefreshTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenInvalidError);
    }
    expect(refreshTokenRepository.revokeAllForUserCalls).to.deep.equal(['user_1']);
  });
});
