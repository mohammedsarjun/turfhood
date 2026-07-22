import {
  resolveAdminGuardRedirect,
  resolveGuardRedirect,
  resolveOtpGuardRedirect,
} from '../routeGuard';

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

describe('resolveAdminGuardRedirect', () => {
  it.each([
    // Unauthenticated visitor hitting an admin route (other than the login page itself).
    ['/admin/dashboard', false, '/admin/login'],
    // A non-admin session is indistinguishable from unauthenticated here — full separation.
    ['/admin/dashboard', false, '/admin/login'],
    // Admin session on an admin route: allowed through.
    ['/admin/dashboard', true, null],
    // Unauthenticated visitor on the login page itself: no redirect, they see the form.
    ['/admin/login', false, null],
    // Already-authenticated admin visiting the login page: sent to the landing page.
    ['/admin/login', true, '/admin/dashboard'],
    // Non-admin paths are untouched by this guard.
    ['/profile', false, null],
    ['/', true, null],
  ])('resolveAdminGuardRedirect(%p, %p) -> %p', (pathname, isAdminAuthenticated, expected) => {
    expect(resolveAdminGuardRedirect(pathname, isAdminAuthenticated)).toBe(expected);
  });
});
