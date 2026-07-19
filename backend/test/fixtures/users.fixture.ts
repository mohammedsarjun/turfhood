import { User } from '../../src/domain/user/entities/User.js';
import { Email } from '../../src/domain/user/value-objects/Email.js';
import { Phone } from '../../src/domain/user/value-objects/Phone.js';
import type { SignUpUserRequestDTO } from '../../src/application/user/dtos/SignUpUserRequestDTO.js';

/** A ready-to-use, valid signup payload. Spread and override fields per test. */
export const validSignUpRequest: SignUpUserRequestDTO = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  phone: '9123456780',
  password: 'password1',
};

/** Builds a User as if it were already persisted — for tests that need an "already exists" record. */
export function buildExistingUser(overrides: { email?: string; phone?: string } = {}): User {
  return User.register({
    name: 'Existing User',
    email: Email.create(overrides.email ?? 'taken@example.com'),
    phone: Phone.create(overrides.phone ?? '9000000000'),
    passwordHash: 'irrelevant',
  });
}

/** A persisted, password-and-phone user — used for profile use-case tests (change-password, etc). */
export function buildPersistedUser(
  overrides: { id?: string; email?: string; phone?: string; passwordHash?: string; avatarUrl?: string } = {},
): User {
  return User.fromPersistence({
    id: overrides.id ?? 'user_1',
    name: 'Jordan Lee',
    email: Email.create(overrides.email ?? 'jordan@example.com'),
    phone: Phone.create(overrides.phone ?? '9123456780'),
    passwordHash: overrides.passwordHash ?? 'hashed-password1',
    authProviders: ['email'],
    roles: ['customer'],
    isVerified: true,
    status: 'active',
    ...(overrides.avatarUrl ? { avatarUrl: overrides.avatarUrl } : {}),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

/** A persisted, Google-only user with no password on file — for set-password tests. */
export function buildGoogleOnlyUser(overrides: { id?: string; email?: string } = {}): User {
  return User.fromPersistence({
    id: overrides.id ?? 'user_1',
    name: 'Jordan Lee',
    email: Email.create(overrides.email ?? 'jordan@example.com'),
    passwordHash: '',
    authProviders: ['google'],
    roles: ['customer'],
    isVerified: true,
    status: 'active',
    googleId: 'google-id-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}
