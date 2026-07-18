import { expect } from 'chai';
import { SendOtpUseCase } from '../../../src/application/otp/use-cases/SendOtpUseCase.js';
import { UserNotFoundError } from '../../../src/domain/user/errors/UserNotFoundError.js';
import { OtpVerification } from '../../../src/domain/otp/entities/OtpVerification.js';
import { Email } from '../../../src/domain/user/value-objects/Email.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeOtpRepository } from '../../mocks/FakeOtpRepository.js';
import { FakeOtpService } from '../../mocks/FakeOtpService.js';
import { FakeEmailService } from '../../mocks/FakeEmailService.js';
import { buildUnverifiedUser, validOtp } from '../../fixtures/otp.fixture.js';

describe('SendOtpUseCase', () => {
  // HAPPY PATH: a registered user requests a code — it's generated, hashed,
  // persisted with a 60s expiry, and emailed in plaintext.
  it('persists an OTP with exactly a 60-second expiry and emails the plaintext code', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    const otpService = new FakeOtpService(validOtp);
    const emailService = new FakeEmailService();
    const useCase = new SendOtpUseCase(userRepository, otpRepository, otpService, emailService);

    const before = Date.now();
    const result = await useCase.execute({ email: 'jordan@example.com', purpose: 'signup' });
    const after = Date.now();

    expect(result).to.deep.equal({ message: 'Verification code sent.', expiresInSeconds: 60 });

    const record = await otpRepository.findLatestActiveByEmail(Email.create('jordan@example.com'), 'signup');
    expect(record).to.not.be.null;
    const expiresAtMs = (record as OtpVerification).expiresAt.getTime();
    expect(expiresAtMs).to.be.at.least(before + 60_000);
    expect(expiresAtMs).to.be.at.most(after + 60_000);

    expect(emailService.sentEmails).to.have.length(1);
    expect(emailService.sentEmails[0]?.to).to.equal('jordan@example.com');
    expect(emailService.sentEmails[0]?.otp).to.equal(validOtp);
    // Never persist/email the hash — only the plaintext code goes to the email service.
    expect((record as OtpVerification).otpHash).to.not.equal(validOtp);
  });

  // Resend/duplicate-send protection: any prior active code for the same
  // email+purpose is invalidated before a new one is issued.
  it('invalidates prior active OTPs for the same email/purpose before issuing a new one', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    const otpService = new FakeOtpService(validOtp);
    const emailService = new FakeEmailService();
    const useCase = new SendOtpUseCase(userRepository, otpRepository, otpService, emailService);

    await useCase.execute({ email: 'jordan@example.com', purpose: 'login' });
    await useCase.execute({ email: 'jordan@example.com', purpose: 'login' });

    expect(otpRepository.invalidateAllForEmailCalls).to.have.length(2);
    // Only the latest issued code should still be "active" (findLatestActiveByEmail returns exactly one).
    const active = await otpRepository.findLatestActiveByEmail(Email.create('jordan@example.com'), 'login');
    expect(active).to.not.be.null;
  });

  // ERROR CASE: no account exists for the requested email.
  it('throws UserNotFoundError when no user exists for the email', async () => {
    const userRepository = new FakeUserRepository({ existingUserByEmail: null });
    const useCase = new SendOtpUseCase(
      userRepository,
      new FakeOtpRepository(),
      new FakeOtpService(validOtp),
      new FakeEmailService(),
    );

    try {
      await useCase.execute({ email: 'unknown@example.com', purpose: 'signup' });
      expect.fail('Expected execute() to throw UserNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(UserNotFoundError);
    }
  });
});
