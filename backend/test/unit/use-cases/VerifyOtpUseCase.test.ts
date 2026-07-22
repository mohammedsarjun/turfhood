import { expect } from 'chai';
import { VerifyOtpUseCase } from '../../../src/application/otp/use-cases/VerifyOtpUseCase.js';
import { OtpExpiredError } from '../../../src/domain/otp/errors/OtpExpiredError.js';
import { OtpInvalidError } from '../../../src/domain/otp/errors/OtpInvalidError.js';
import { OtpMaxAttemptsError } from '../../../src/domain/otp/errors/OtpMaxAttemptsError.js';
import { OtpNotFoundError } from '../../../src/domain/otp/errors/OtpNotFoundError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeOtpRepository } from '../../mocks/FakeOtpRepository.js';
import { FakeOtpService } from '../../mocks/FakeOtpService.js';
import { FakePasswordHasher } from '../../mocks/FakePasswordHasher.js';
import { FakeRefreshTokenRepository } from '../../mocks/FakeRefreshTokenRepository.js';
import { buildOtpRecord, buildUnverifiedUser, validOtp } from '../../fixtures/otp.fixture.js';
import { JwtTokenService } from '../../../src/infrastructure/user/services/JwtTokenService.js';
import { JwtRefreshTokenService } from '../../../src/infrastructure/refreshToken/services/JwtRefreshTokenService.js';
import { Email } from '../../../src/domain/user/value-objects/Email.js';

// A real JwtTokenService is used (not faked) since token generation is pure/cheap
// and exercising it here also catches accidental payload-shape regressions.
function buildTokenService(): JwtTokenService {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-only-secret';
  return new JwtTokenService();
}

function buildRefreshTokenService(): JwtRefreshTokenService {
  process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'test-only-refresh-secret';
  return new JwtRefreshTokenService();
}

describe('VerifyOtpUseCase', () => {
  // HAPPY PATH: correct code, not expired, under the attempt cap.
  it('succeeds, marks the user verified, and returns an access token', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(buildOtpRecord({ email: 'jordan@example.com', purpose: 'login' }));
    const useCase = new VerifyOtpUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    const result = await useCase.execute({
      email: 'jordan@example.com',
      otp: validOtp,
      purpose: 'login',
    });

    expect(result.isVerified).to.equal(true);
    expect(result.accessToken).to.be.a('string').that.is.not.empty;
    expect(userRepository.markVerifiedCalls).to.deep.equal(['jordan@example.com']);
  });

  // ERROR CASE: wrong code — attempt count must increment, and the specific
  // OTP_INVALID error must be thrown (not a generic failure).
  it('throws OtpInvalidError and increments attemptCount on mismatch', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(
      buildOtpRecord({ id: 'otp_1', email: 'jordan@example.com', purpose: 'login' }),
    );
    const useCase = new VerifyOtpUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ email: 'jordan@example.com', otp: '000000', purpose: 'login' });
      expect.fail('Expected execute() to throw OtpInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpInvalidError);
    }

    const record = await otpRepository.findLatestActiveByEmail(
      Email.create('jordan@example.com'),
      'login',
    );
    expect(record?.attemptCount).to.equal(1);
  });

  // BOUNDARY CASE: expiresAt exactly 1ms in the past must be rejected as expired.
  it('throws OtpExpiredError once now is past expiresAt (60s boundary)', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(
      buildOtpRecord({
        email: 'jordan@example.com',
        purpose: 'login',
        expiresAt: new Date(Date.now() - 1),
      }),
    );
    const useCase = new VerifyOtpUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ email: 'jordan@example.com', otp: validOtp, purpose: 'login' });
      expect.fail('Expected execute() to throw OtpExpiredError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpExpiredError);
    }
  });

  // BOUNDARY CASE: expiresAt 1ms in the future must still be accepted (not yet expired).
  it('accepts a code that has not yet expired (1ms before the boundary)', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(
      buildOtpRecord({
        email: 'jordan@example.com',
        purpose: 'login',
        expiresAt: new Date(Date.now() + 1),
      }),
    );
    const useCase = new VerifyOtpUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    const result = await useCase.execute({
      email: 'jordan@example.com',
      otp: validOtp,
      purpose: 'login',
    });
    expect(result.isVerified).to.equal(true);
  });

  // ERROR CASE: too many prior wrong attempts blocks further tries, even with the correct code.
  it('throws OtpMaxAttemptsError once attemptCount reaches the cap', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(
      buildOtpRecord({ email: 'jordan@example.com', purpose: 'login', attemptCount: 5 }),
    );
    const useCase = new VerifyOtpUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ email: 'jordan@example.com', otp: validOtp, purpose: 'login' });
      expect.fail('Expected execute() to throw OtpMaxAttemptsError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpMaxAttemptsError);
    }
  });

  // ERROR CASE: no active record at all for this email/purpose.
  it('throws OtpNotFoundError when no active record exists', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const useCase = new VerifyOtpUseCase(
      userRepository,
      new FakeOtpRepository(),
      new FakeOtpService(validOtp),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ email: 'jordan@example.com', otp: validOtp, purpose: 'login' });
      expect.fail('Expected execute() to throw OtpNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpNotFoundError);
    }
  });

  // ERROR CASE: the record exists but was already consumed by a prior successful verify.
  it('throws OtpNotFoundError when the record is already consumed', async () => {
    const user = buildUnverifiedUser({ email: 'jordan@example.com' });
    const userRepository = new FakeUserRepository({ existingUserByEmail: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(
      buildOtpRecord({ email: 'jordan@example.com', purpose: 'login', consumedAt: new Date() }),
    );
    const useCase = new VerifyOtpUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
      buildTokenService(),
      new FakeRefreshTokenRepository(),
      buildRefreshTokenService(),
    );

    try {
      await useCase.execute({ email: 'jordan@example.com', otp: validOtp, purpose: 'login' });
      expect.fail('Expected execute() to throw OtpNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpNotFoundError);
    }
  });
});
