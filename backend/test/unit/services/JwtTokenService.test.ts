import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';
import { TokenExpiredError } from '../../../src/domain/user/errors/TokenExpiredError.js';
import { TokenInvalidError } from '../../../src/domain/user/errors/TokenInvalidError.js';
import { env } from '../../../src/config/env.js';

describe('JwtTokenService', () => {
  const payload = { userId: 'user_1', roles: ['customer'] as const };

  // HAPPY PATH: signing produces a verifiable token carrying exactly the given claims plus iat/exp.
  it('generateAccessToken signs a token whose payload round-trips through verifyAccessToken', () => {
    const service = new JwtTokenService();

    const token = service.generateAccessToken({ userId: payload.userId, roles: [...payload.roles] });
    const verified = service.verifyAccessToken(token);

    expect(verified.userId).to.equal(payload.userId);
    expect(verified.roles).to.deep.equal([...payload.roles]);
    expect(verified.exp).to.be.a('number');
    expect(verified.iat).to.be.a('number');
    expect(verified.exp as number).to.be.greaterThan(verified.iat as number);
  });

  // HAPPY PATH: a freshly-issued token is accepted.
  it('verifyAccessToken returns the payload for a valid token', () => {
    const service = new JwtTokenService();
    const token = service.generateAccessToken({ userId: payload.userId, roles: [...payload.roles] });

    expect(service.verifyAccessToken(token)).to.include({ userId: payload.userId });
  });

  // BRANCH UNDER TEST: an expired token must raise TokenExpiredError, not the generic invalid case.
  it('verifyAccessToken throws TokenExpiredError for an expired token', () => {
    const service = new JwtTokenService();
    const expiredToken = jwt.sign({ userId: payload.userId, roles: payload.roles }, env.JWT_SECRET, {
      expiresIn: -10,
    });

    try {
      service.verifyAccessToken(expiredToken);
      expect.fail('Expected verifyAccessToken() to throw TokenExpiredError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(TokenExpiredError);
    }
  });

  // BRANCH UNDER TEST: a token signed with the wrong secret must be rejected as invalid.
  it('verifyAccessToken throws TokenInvalidError for a token signed with a different secret', () => {
    const service = new JwtTokenService();
    const forgedToken = jwt.sign({ userId: payload.userId, roles: payload.roles }, 'wrong-secret');

    try {
      service.verifyAccessToken(forgedToken);
      expect.fail('Expected verifyAccessToken() to throw TokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(TokenInvalidError);
    }
  });

  // BRANCH UNDER TEST: a malformed (non-JWT) string must be rejected as invalid.
  it('verifyAccessToken throws TokenInvalidError for a malformed token string', () => {
    const service = new JwtTokenService();

    try {
      service.verifyAccessToken('not-a-real-jwt');
      expect.fail('Expected verifyAccessToken() to throw TokenInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(TokenInvalidError);
    }
  });
});
