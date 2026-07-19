import { expect } from 'chai';
import { SeedAdminUseCase } from '../../../src/application/admin/use-cases/SeedAdminUseCase.js';
import { WeakPasswordError } from '../../../src/domain/user/errors/WeakPasswordError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { buildAdminUser } from '../../fixtures/users.fixture.js';

const validSeedRequest = {
  name: 'Admin',
  email: 'admin@turfhood.com',
  password: 'adminPassword1',
};

describe('SeedAdminUseCase', () => {
  it('creates the admin when none exists, hashing the password and setting roles: [admin]', async () => {
    const userRepository = new FakeUserRepository({ existingUserByEmail: null });
    const useCase = new SeedAdminUseCase(userRepository, new FakePasswordHasher());

    await useCase.execute(validSeedRequest);

    expect(userRepository.createCalls).to.have.length(1);
    const created = userRepository.createCalls[0];
    expect(created?.roles).to.deep.equal(['admin']);
    expect(created?.isVerified).to.equal(true);
    expect(created?.passwordHash).to.equal('hashed-adminPassword1');
    expect(created?.passwordHash).to.not.equal(validSeedRequest.password);
  });

  it('does nothing when a user with that email already exists (idempotent)', async () => {
    const existing = buildAdminUser({ email: 'admin@turfhood.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: existing });
    const useCase = new SeedAdminUseCase(userRepository, new FakePasswordHasher());

    await useCase.execute(validSeedRequest);

    expect(userRepository.createCalls).to.have.length(0);
  });

  it('never overwrites/promotes a non-admin account that already has that email', async () => {
    const existingCustomer = buildAdminUser({ email: 'admin@turfhood.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: existingCustomer });
    const useCase = new SeedAdminUseCase(userRepository, new FakePasswordHasher());

    await useCase.execute(validSeedRequest);

    expect(userRepository.createCalls).to.have.length(0);
    expect(userRepository.updatePasswordCalls).to.have.length(0);
  });

  it('throws WeakPasswordError for a misconfigured weak ADMIN_PASSWORD (fail-fast on startup)', async () => {
    const userRepository = new FakeUserRepository({ existingUserByEmail: null });
    const useCase = new SeedAdminUseCase(userRepository, new FakePasswordHasher());

    try {
      await useCase.execute({ ...validSeedRequest, password: 'short' });
      expect.fail('Expected execute() to throw WeakPasswordError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(WeakPasswordError);
    }
    expect(userRepository.createCalls).to.have.length(0);
  });
});
