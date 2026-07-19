import { expect } from 'chai';
import { LoginUserUseCase } from '../../../src/application/user/use-cases/LoginUserUseCase.js';
import { AccountSuspendedError } from '../../../src/domain/user/errors/AccountSuspendedError.js';
import { InvalidCredentialsError } from '../../../src/domain/user/errors/InvalidCredentialsError.js';
import { User } from '../../../src/domain/user/entities/User.js';
import { Email } from '../../../src/domain/user/value-objects/Email.js';
import { Phone } from '../../../src/domain/user/value-objects/Phone.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { buildUnverifiedUser, buildVerifiedUser } from '../../fixtures/otp.fixture.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';

function buildTokenService(): JwtTokenService {
  return new JwtTokenService();
}

function buildUserWithStatus(status: 'active' | 'suspended' | 'deleted'): User {
  return User.fromPersistence({
    id: 'user_1',
    name: 'Jordan Lee',
    email: Email.create('jordan@example.com'),
    phone: Phone.create('9123456780'),
    passwordHash: 'hashed-password1',
    authProviders: ['email'],
    roles: ['customer'],
    isVerified: true,
    status,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

describe('LoginUserUseCase', () => {
  // HAPPY PATH: verified, active user with correct credentials logs in successfully.
  it("returns status:'success' with an access token for a verified user", async () => {
    const user = buildVerifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const useCase = new LoginUserUseCase(
      userRepository,
      new FakePasswordHasher(),
      buildTokenService(),
    );

    const result = await useCase.execute({ email: 'jordan@example.com', password: 'password1' });

    expect(result.status).to.equal('success');
    if (result.status === 'success') {
      expect(result.accessToken).to.be.a('string').that.is.not.empty;
      expect(result.user.email).to.equal('jordan@example.com');
    }
  });

  // BRANCH UNDER TEST: correct credentials but isVerified:false — must NOT log in,
  // must NOT issue a token, and must signal needs_verification instead.
  it("returns status:'needs_verification' (no token) for an unverified user with correct credentials", async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const useCase = new LoginUserUseCase(
      userRepository,
      new FakePasswordHasher(),
      buildTokenService(),
    );

    const result = await useCase.execute({ email: 'jordan@example.com', password: 'password1' });

    expect(result).to.deep.equal({
      status: 'needs_verification',
      email: 'jordan@example.com',
      message: 'Please verify your email to continue.',
    });
  });

  // REGRESSION: wrong password must still be rejected regardless of isVerified.
  it('still throws InvalidCredentialsError for a wrong password regardless of isVerified', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const passwordHasher = new FakePasswordHasher();
    passwordHasher.compare = async () => false;
    const useCase = new LoginUserUseCase(userRepository, passwordHasher, buildTokenService());

    try {
      await useCase.execute({ email: 'jordan@example.com', password: 'wrong-password' });
      expect.fail('Expected execute() to throw InvalidCredentialsError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidCredentialsError);
    }
  });

  // REGRESSION: a suspended account must still be rejected regardless of isVerified.
  it('still throws AccountSuspendedError for a suspended user regardless of isVerified', async () => {
    const user = buildUserWithStatus('suspended');
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const useCase = new LoginUserUseCase(
      userRepository,
      new FakePasswordHasher(),
      buildTokenService(),
    );

    try {
      await useCase.execute({ email: 'jordan@example.com', password: 'password1' });
      expect.fail('Expected execute() to throw AccountSuspendedError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(AccountSuspendedError);
    }
  });
});
