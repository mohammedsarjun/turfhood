import {
  isAuthRoute,
  isAdminRoute,
  isProtectedRoute,
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
    ['/my-turfs', false, '/login'],
    ['/turf-portal/application_1/dashboard', false, '/login'],
    ['/turf-portal/application_1/dashboard', true, null],
    ['/become-a-turf-owner', false, '/login'],
    ['/become-a-turf-owner/apply', false, '/login'],
    ['/login', true, '/'],
    ['/login', false, null],
    ['/signup', true, '/'],
    ['/signup', false, null],
    ['/some-other-page', false, null],
    ['/some-other-page', true, null],
  ])('resolveGuardRedirect(%p, %p) -> %p', (pathname, isAuthenticated, expected) => {
    expect(resolveGuardRedirect(pathname, isAuthenticated)).toBe(expected);
  });

  it('classifies protected and logged-out-only routes', () => {
    expect(isProtectedRoute('/my-turfs')).toBe(true);
    expect(isProtectedRoute('/turf-portal/application_1/dashboard')).toBe(true);
    expect(isProtectedRoute('/login')).toBe(false);
    expect(isAuthRoute('/login')).toBe(true);
    expect(isAuthRoute('/profile')).toBe(false);
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
    ['/admin', false, '/admin/login'],
    ['/admin', true, '/admin/dashboard'],
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

  it.each([
    ['/admin', true],
    ['/admin/dashboard', true],
    ['/administrator', false],
    ['/profile', false],
  ])('isAdminRoute(%p) -> %p', (pathname, expected) => {
    expect(isAdminRoute(pathname)).toBe(expected);
  });
});
