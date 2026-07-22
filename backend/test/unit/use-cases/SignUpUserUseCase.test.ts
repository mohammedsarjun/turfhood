import { expect } from 'chai';
import { SignUpUserUseCase } from '../../../src/application/user/use-cases/SignUpUserUseCase.js';
import { SendOtpUseCase } from '../../../src/application/otp/use-cases/SendOtpUseCase.js';
import { DuplicateEmailError } from '../../../src/domain/user/errors/DuplicateEmailError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { FakeOtpRepository } from '../../mocks/FakeOtpRepository.js';
import { FakeOtpService } from '../../mocks/FakeOtpService.js';
import { FakeEmailService } from '../../mocks/FakeEmailService.js';
import { FakeOtpSessionTokenService } from '../../mocks/FakeOtpSessionTokenService.js';
import { validSignUpRequest, buildExistingUser } from '../../fixtures/users.fixture.js';

/**
 * SendOtpUseCase looks the newly-created user back up by email, so it's given
 * its own repository stub that "knows" about that user — separate from the
 * repository SignUpUserUseCase uses for its own duplicate-email/-phone checks.
 */
function buildSendOtpUseCase(emailService: FakeEmailService): SendOtpUseCase {
  const otpUserRepository = new FakeUserRepository({
    existingUserByEmail: buildExistingUser({ email: validSignUpRequest.email }),
  });
  return new SendOtpUseCase(
    otpUserRepository,
    new FakeOtpRepository(),
    new FakeOtpService(),
    emailService,
    new FakeOtpSessionTokenService(),
  );
}

describe('SignUpUserUseCase', () => {
  // HAPPY PATH: no existing user with that email/phone, so signup should succeed and a signup OTP should be sent.
  it('creates a new user and sends a signup OTP when the email is not already registered (happy path)', async () => {
    const emailService = new FakeEmailService();
    const useCase = new SignUpUserUseCase(
      new FakeUserRepository(),
      new FakePasswordHasher(),
      buildSendOtpUseCase(emailService),
    );

    const result = await useCase.execute(validSignUpRequest);

    expect(result.user.name).to.equal(validSignUpRequest.name);
    expect(result.user.email).to.equal(validSignUpRequest.email);
    expect(result.expiresInSeconds).to.be.a('number');
    expect(emailService.sentEmails).to.have.length(1);
    expect(emailService.sentEmails[0]?.to).to.equal(validSignUpRequest.email);
  });

  // ERROR CASE: an account with this email already "exists" in our fake
  // repository, so signup must be rejected instead of creating a duplicate.
  it('throws DuplicateEmailError when the email is already registered (error case)', async () => {
    const existingUser = buildExistingUser({ email: 'taken@example.com' });
    const repository = new FakeUserRepository({ existingUserByEmail: existingUser });
    const useCase = new SignUpUserUseCase(
      repository,
      new FakePasswordHasher(),
      buildSendOtpUseCase(new FakeEmailService()),
    );

    try {
      await useCase.execute({
        ...validSignUpRequest,
        email: 'taken@example.com',
        phone: '9111111111',
      });
      // If execute() didn't throw, the test should fail explicitly.
      expect.fail('Expected execute() to throw DuplicateEmailError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(DuplicateEmailError);
    }
  });
});
