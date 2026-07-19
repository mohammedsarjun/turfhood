/**
 * @jest-environment node
 *
 * jose's WebCrypto build does `instanceof Uint8Array` checks that fail across the
 * jsdom/vm realm boundary — this file needs no DOM, so run it under Node instead.
 */
import { SignJWT } from 'jose';
import { verifyAccessToken } from '../session';

const TEST_SECRET = 'test-only-secret';

async function signToken(secret: string, expSecondsFromNow: number): Promise<string> {
  return new SignJWT({ userId: 'user_1', roles: ['customer'] })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expSecondsFromNow)
    .sign(new TextEncoder().encode(secret));
}

describe('verifyAccessToken', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  // HAPPY PATH: a validly-signed, unexpired token resolves to its payload.
  it('returns the payload for a valid, unexpired token', async () => {
    const token = await signToken(TEST_SECRET, 60);

    const session = await verifyAccessToken(token);

    expect(session).not.toBeNull();
    expect(session?.userId).toBe('user_1');
  });

  // BRANCH UNDER TEST: no token at all (unauthenticated visitor) resolves to null.
  it('returns null for an undefined token', async () => {
    expect(await verifyAccessToken(undefined)).toBeNull();
  });

  // BRANCH UNDER TEST: an expired token must not authenticate the request.
  it('returns null for an expired token', async () => {
    const token = await signToken(TEST_SECRET, -60);

    expect(await verifyAccessToken(token)).toBeNull();
  });

  // BRANCH UNDER TEST: a token signed with a different secret must be rejected.
  it('returns null for a token signed with the wrong secret', async () => {
    const token = await signToken('a-different-secret', 60);

    expect(await verifyAccessToken(token)).toBeNull();
  });

  // BRANCH UNDER TEST: a malformed (non-JWT) string must be rejected.
  it('returns null for a malformed token string', async () => {
    expect(await verifyAccessToken('not-a-real-jwt')).toBeNull();
  });
});
