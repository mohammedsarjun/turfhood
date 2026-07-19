import { expect } from 'chai';
import { AdminLoginUseCase } from '../../../src/application/admin/use-cases/AdminLoginUseCase.js';
import { InvalidAdminCredentialsError } from '../../../src/domain/admin/errors/InvalidAdminCredentialsError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { buildAdminUser, buildPersistedUser } from '../../fixtures/users.fixture.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';

function buildTokenService(): JwtTokenService {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-only-secret';
  return new JwtTokenService();
}

describe('AdminLoginUseCase', () => {
  it('succeeds for correct admin credentials and issues a token with roles: [admin]', async () => {
    const admin = buildAdminUser({ id: 'admin_1', email: 'admin@turfhood.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: admin });
    const tokenService = buildTokenService();
    const useCase = new AdminLoginUseCase(userRepository, new FakePasswordHasher(true), tokenService);

    const result = await useCase.execute({
      email: 'admin@turfhood.com',
      password: 'adminPassword1',
    });

    expect(result.admin.id).to.equal('admin_1');
    expect(result.accessToken).to.be.a('string').that.is.not.empty;
    const payload = tokenService.verifyAccessToken(result.accessToken);
    expect(payload.roles).to.deep.equal(['admin']);
  });

  it('throws InvalidAdminCredentialsError for a wrong password', async () => {
    const admin = buildAdminUser({ email: 'admin@turfhood.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: admin });
    const useCase = new AdminLoginUseCase(
      userRepository,
      new FakePasswordHasher(false),
      buildTokenService(),
    );

    try {
      await useCase.execute({ email: 'admin@turfhood.com', password: 'wrong-password' });
      expect.fail('Expected execute() to throw InvalidAdminCredentialsError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAdminCredentialsError);
    }
  });

  it('throws InvalidAdminCredentialsError when no account exists for the email', async () => {
    const userRepository = new FakeUserRepository({ existingUserByEmail: null });
    const useCase = new AdminLoginUseCase(
      userRepository,
      new FakePasswordHasher(true),
      buildTokenService(),
    );

    try {
      await useCase.execute({ email: 'nobody@turfhood.com', password: 'adminPassword1' });
      expect.fail('Expected execute() to throw InvalidAdminCredentialsError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAdminCredentialsError);
    }
  });

  it('throws InvalidAdminCredentialsError for a correct-password non-admin account', async () => {
    const customer = buildPersistedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: customer });
    const useCase = new AdminLoginUseCase(
      userRepository,
      new FakePasswordHasher(true),
      buildTokenService(),
    );

    try {
      await useCase.execute({ email: 'jordan@example.com', password: 'password1' });
      expect.fail('Expected execute() to throw InvalidAdminCredentialsError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidAdminCredentialsError);
    }
  });
});
