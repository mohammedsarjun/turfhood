import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { container } from 'tsyringe';
import {
  authenticate,
  type AuthenticatedRequest,
} from '../../../src/presentation/shared/middlewares/authenticate.js';
import { USER_TOKENS } from '../../../src/domain/user/tokens.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';
import { TokenExpiredError } from '../../../src/domain/user/errors/TokenExpiredError.js';
import { TokenInvalidError } from '../../../src/domain/user/errors/TokenInvalidError.js';
import { TokenMissingError } from '../../../src/domain/user/errors/TokenMissingError.js';
import { env } from '../../../src/config/env.js';

function buildRequest(options: { authorization?: string; cookies?: Record<string, string> }): Request {
  return {
    headers: { authorization: options.authorization },
    cookies: options.cookies ?? {},
  } as unknown as Request;
}

describe('authenticate middleware', () => {
  const tokenService = new JwtTokenService();
  const validToken = tokenService.generateAccessToken({ userId: 'user_1', roles: ['customer'] });

  beforeEach(() => {
    container.register(USER_TOKENS.TokenService, { useValue: tokenService });
  });

  // HAPPY PATH: a valid Bearer token authenticates the request and calls next() with no error.
  it('calls next() with no error and sets req.user for a valid Bearer token', () => {
    const req = buildRequest({ authorization: `Bearer ${validToken}` });
    let nextArg: unknown = 'not-called';

    authenticate(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.undefined;
    expect((req as AuthenticatedRequest).user?.userId).to.equal('user_1');
  });

  // HAPPY PATH: falls back to the accessToken cookie when there's no Authorization header.
  it('calls next() with no error and sets req.user for a valid accessToken cookie', () => {
    const req = buildRequest({ cookies: { accessToken: validToken } });
    let nextArg: unknown = 'not-called';

    authenticate(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.undefined;
    expect((req as AuthenticatedRequest).user?.userId).to.equal('user_1');
  });

  // BRANCH UNDER TEST: no token anywhere on the request must be rejected before reaching the controller.
  it('calls next(TokenMissingError) when no token is present', () => {
    const req = buildRequest({});
    let nextArg: unknown = 'not-called';

    authenticate(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(TokenMissingError);
  });

  // BRANCH UNDER TEST: an expired token is rejected with the specific expired error.
  it('calls next(TokenExpiredError) for an expired token', () => {
    const token = jwt.sign({ userId: 'user_1', roles: ['customer'] }, env.JWT_SECRET, {
      expiresIn: -10,
    });
    const req = buildRequest({ authorization: `Bearer ${token}` });
    let nextArg: unknown = 'not-called';

    authenticate(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(TokenExpiredError);
  });

  // BRANCH UNDER TEST: a malformed token is rejected with the generic invalid error.
  it('calls next(TokenInvalidError) for a malformed token', () => {
    const req = buildRequest({ authorization: 'Bearer not-a-real-jwt' });
    let nextArg: unknown = 'not-called';

    authenticate(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(TokenInvalidError);
  });
});
