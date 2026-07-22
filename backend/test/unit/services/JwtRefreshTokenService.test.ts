import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { JwtRefreshTokenService } from '../../../src/infrastructure/refreshToken/services/JwtRefreshTokenService.js';
import { RefreshTokenExpiredError } from '../../../src/domain/refreshToken/errors/RefreshTokenExpiredError.js';
import { RefreshTokenInvalidError } from '../../../src/domain/refreshToken/errors/RefreshTokenInvalidError.js';
import { env } from '../../../src/config/env.js';

describe('JwtRefreshTokenService', () => {
  const payload = { userId: 'user_1', roles: ['customer'] as const };

  // HAPPY PATH: generate() signs a token carrying a jti, verify() round-trips it back out.
  it('generate() signs a token whose payload round-trips through verify()', () => {
    const service = new JwtRefreshTokenService();

    const issued = service.generate({ userId: payload.userId, roles: [...payload.roles] });
    const verified = service.verify(issued.token);

    expect(verified.userId).to.equal(payload.userId);
    expect(verified.roles).to.deep.equal([...payload.roles]);
    expect(verified.jti).to.equal(issued.jti);
    expect(issued.expiresAt.getTime()).to.be.greaterThan(Date.now());
  });

  // BRANCH UNDER TEST: two tokens for the same user get distinct jtis.
  it('generate() issues a distinct jti on every call', () => {
    const service = new JwtRefreshTokenService();

    const first = service.generate({ userId: payload.userId, roles: [...payload.roles] });
    const second = service.generate({ userId: payload.userId, roles: [...payload.roles] });

    expect(first.jti).to.not.equal(second.jti);
  });

  // BRANCH UNDER TEST: an expired token must raise RefreshTokenExpiredError.
  it('verify() throws RefreshTokenExpiredError for an expired token', () => {
    const service = new JwtRefreshTokenService();
    const expiredToken = jwt.sign(
      { userId: payload.userId, roles: payload.roles, jti: 'jti_1' },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: -10 },
    );

    try {
      service.verify(expiredToken);
      expect.fail('Expected verify() to throw RefreshTokenExpiredError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenExpiredError);
    }
  });

  // BRANCH UNDER TEST: a token signed with the wrong secret must be rejected as invalid.
  it('verify() throws RefreshTokenInvalidError for a token signed with a different secret', () => {
    const service = new JwtRefreshTokenService();
    const forgedToken = jwt.sign(
      { userId: payload.userId, roles: payload.roles, jti: 'jti_1' },
      'wrong-secret',
    );

    try {
      service.verify(forgedToken);
      expect.fail('Expected verify() to throw RefreshTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenInvalidError);
    }
  });

  // BRANCH UNDER TEST: a malformed (non-JWT) string must be rejected as invalid.
  it('verify() throws RefreshTokenInvalidError for a malformed token string', () => {
    const service = new JwtRefreshTokenService();

    try {
      service.verify('not-a-real-jwt');
      expect.fail('Expected verify() to throw RefreshTokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefreshTokenInvalidError);
    }
  });
});
