import { expect } from 'chai';
import { GetCurrentUserUseCase } from '../../../src/application/user/use-cases/GetCurrentUserUseCase.js';
import { UserNotFoundError } from '../../../src/domain/user/errors/UserNotFoundError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { buildVerifiedUser } from '../../fixtures/otp.fixture.js';

describe('GetCurrentUserUseCase', () => {
  // HAPPY PATH: an existing user id resolves to its safe, outward-facing profile shape.
  it("returns the user's UserResponseDTO for a known id", async () => {
    const user = buildVerifiedUser({ id: 'user_1', email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const useCase = new GetCurrentUserUseCase(userRepository);

    const result = await useCase.execute('user_1');

    expect(result).to.deep.equal({
      id: 'user_1',
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: '9123456780',
      roles: ['customer'],
      isVerified: true,
      status: 'active',
      createdAt: user.createdAt,
    });
  });

  // BRANCH UNDER TEST: a userId with no matching user (e.g. deleted after token issuance) must 404.
  it('throws UserNotFoundError when no user matches the given id', async () => {
    const userRepository = new FakeUserRepository({ existingUserById: null });
    const useCase = new GetCurrentUserUseCase(userRepository);

    try {
      await useCase.execute('missing_user');
      expect.fail('Expected execute() to throw UserNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(UserNotFoundError);
    }
  });
});
