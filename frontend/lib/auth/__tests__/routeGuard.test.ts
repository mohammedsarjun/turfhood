import { resolveGuardRedirect, resolveOtpGuardRedirect } from '../routeGuard';

describe('resolveGuardRedirect', () => {
  it.each([
    ['/', false, '/login'],
    ['/', true, null],
    ['/profile', false, '/login'],
    ['/profile', true, null],
    ['/login', true, '/'],
    ['/login', false, null],
    ['/signup', true, '/'],
    ['/signup', false, null],
    ['/some-other-page', false, null],
    ['/some-other-page', true, null],
  ])('resolveGuardRedirect(%p, %p) -> %p', (pathname, isAuthenticated, expected) => {
    expect(resolveGuardRedirect(pathname, isAuthenticated)).toBe(expected);
  });
});

describe('resolveOtpGuardRedirect', () => {
  it.each([
    ['/otp', false, '/login'],
    ['/otp', true, null],
    ['/some-other-page', false, null],
    ['/some-other-page', true, null],
  ])('resolveOtpGuardRedirect(%p, %p) -> %p', (pathname, hasOtpSession, expected) => {
    expect(resolveOtpGuardRedirect(pathname, hasOtpSession)).toBe(expected);
  });
});
