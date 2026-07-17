import { expect } from 'chai';
import { SignUpUserUseCase } from '../../../src/application/user/use-cases/SignUpUserUseCase.js';
import { DuplicateEmailError } from '../../../src/domain/user/errors/DuplicateEmailError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { validSignUpRequest, buildExistingUser } from '../../fixtures/users.fixture.js';

describe('SignUpUserUseCase', () => {
  // HAPPY PATH: no existing user with that email/phone, so signup should succeed.
  it('creates a new user when the email is not already registered (happy path)', async () => {
    const useCase = new SignUpUserUseCase(new FakeUserRepository(), new FakePasswordHasher());

    const result = await useCase.execute(validSignUpRequest);

    expect(result.name).to.equal(validSignUpRequest.name);
    expect(result.email).to.equal(validSignUpRequest.email);
  });

  // ERROR CASE: an account with this email already "exists" in our fake
  // repository, so signup must be rejected instead of creating a duplicate.
  it('throws DuplicateEmailError when the email is already registered (error case)', async () => {
    const existingUser = buildExistingUser({ email: 'taken@example.com' });
    const repository = new FakeUserRepository({ existingUserByEmail: existingUser });
    const useCase = new SignUpUserUseCase(repository, new FakePasswordHasher());

    try {
      await useCase.execute({ ...validSignUpRequest, email: 'taken@example.com', phone: '9111111111' });
      // If execute() didn't throw, the test should fail explicitly.
      expect.fail('Expected execute() to throw DuplicateEmailError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(DuplicateEmailError);
    }
  });
});
