import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { container } from 'tsyringe';
import {
  adminOnly,
  type AdminAuthenticatedRequest,
} from '../../../src/presentation/admin/middlewares/adminOnly.js';
import { USER_TOKENS } from '../../../src/domain/user/tokens.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';
import { AdminAccessRequiredError } from '../../../src/domain/admin/errors/AdminAccessRequiredError.js';
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

describe('adminOnly middleware', () => {
  const tokenService = new JwtTokenService();
  const adminToken = tokenService.generateAccessToken({ userId: 'admin_1', roles: ['admin'] });
  const userToken = tokenService.generateAccessToken({ userId: 'user_1', roles: ['customer'] });

  beforeEach(() => {
    container.register(USER_TOKENS.TokenService, { useValue: tokenService });
  });

  // HAPPY PATH: a valid admin-scoped token (adminAccessToken cookie) passes and sets req.admin.
  it('calls next() with no error and sets req.admin for a valid admin token', () => {
    const req = buildRequest({ cookies: { adminAccessToken: adminToken } });
    let nextArg: unknown = 'not-called';

    adminOnly(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.undefined;
    expect((req as AdminAuthenticatedRequest).admin?.userId).to.equal('admin_1');
  });

  // Also accepted via Authorization header, same extraction style as `authenticate`.
  it('calls next() with no error for a valid admin Bearer token', () => {
    const req = buildRequest({ authorization: `Bearer ${adminToken}` });
    let nextArg: unknown = 'not-called';

    adminOnly(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.undefined;
  });

  // FULL SEPARATION: a structurally valid but non-admin token must be rejected, not downgraded.
  it('calls next(AdminAccessRequiredError) for a valid non-admin user token', () => {
    const req = buildRequest({ cookies: { adminAccessToken: userToken } });
    let nextArg: unknown = 'not-called';

    adminOnly(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(AdminAccessRequiredError);
  });

  // A regular user's accessToken cookie is never even looked at by adminOnly.
  it('calls next(TokenMissingError) when only the regular accessToken cookie is present', () => {
    const req = buildRequest({ cookies: { accessToken: adminToken } });
    let nextArg: unknown = 'not-called';

    adminOnly(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(TokenMissingError);
  });

  it('calls next(TokenMissingError) when no token is present', () => {
    const req = buildRequest({});
    let nextArg: unknown = 'not-called';

    adminOnly(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(TokenMissingError);
  });

  it('calls next(TokenExpiredError) for an expired admin token', () => {
    const token = jwt.sign({ userId: 'admin_1', roles: ['admin'] }, env.JWT_SECRET, {
      expiresIn: -10,
    });
    const req = buildRequest({ cookies: { adminAccessToken: token } });
    let nextArg: unknown = 'not-called';

    adminOnly(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(TokenExpiredError);
  });

  it('calls next(TokenInvalidError) for a malformed admin token', () => {
    const req = buildRequest({ cookies: { adminAccessToken: 'not-a-real-jwt' } });
    let nextArg: unknown = 'not-called';

    adminOnly(req, {} as Response, (error) => {
      nextArg = error;
    });

    expect(nextArg).to.be.instanceOf(TokenInvalidError);
  });
});
