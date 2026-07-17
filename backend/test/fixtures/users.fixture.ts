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
