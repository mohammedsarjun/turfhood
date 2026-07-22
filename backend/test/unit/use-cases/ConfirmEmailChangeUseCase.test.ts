import { expect } from 'chai';
import { ConfirmEmailChangeUseCase } from '../../../src/application/user/use-cases/ConfirmEmailChangeUseCase.js';
import { OtpExpiredError } from '../../../src/domain/otp/errors/OtpExpiredError.js';
import { OtpInvalidError } from '../../../src/domain/otp/errors/OtpInvalidError.js';
import { OtpNotFoundError } from '../../../src/domain/otp/errors/OtpNotFoundError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeOtpRepository } from '../../mocks/FakeOtpRepository.js';
import { FakeOtpService } from '../../mocks/FakeOtpService.js';
import { buildPersistedUser } from '../../fixtures/users.fixture.js';
import { OtpVerification } from '../../../src/domain/otp/entities/OtpVerification.js';

const validOtp = '123456';

function buildEmailChangeOtpRecord(
  overrides: {
    userId?: string;
    email?: string;
    expiresAt?: Date;
    consumedAt?: Date;
    attemptCount?: number;
  } = {},
): OtpVerification {
  return OtpVerification.fromPersistence({
    id: 'otp_1',
    userId: overrides.userId ?? 'user_1',
    email: overrides.email ?? 'new@example.com',
    purpose: 'email_change',
    otpHash: `hashed-${validOtp}`,
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
    ...(overrides.consumedAt ? { consumedAt: overrides.consumedAt } : {}),
    attemptCount: overrides.attemptCount ?? 0,
    createdAt: new Date(),
  });
}

describe('ConfirmEmailChangeUseCase', () => {
  it('commits the email change once the correct code is submitted', async () => {
    const user = buildPersistedUser({ id: 'user_1', email: 'old@example.com' });
    const userRepository = new FakeUserRepository({
      existingUserById: user,
      existingUserByEmail: null,
    });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(buildEmailChangeOtpRecord());
    const useCase = new ConfirmEmailChangeUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
    );

    const result = await useCase.execute({
      userId: 'user_1',
      newEmail: 'new@example.com',
      otp: validOtp,
    });

    expect(result.message).to.equal('Email updated successfully.');
    expect(userRepository.updateEmailCalls).to.deep.equal([
      { userId: 'user_1', email: 'new@example.com' },
    ]);
  });

  it('rejects an incorrect code and leaves the old email untouched', async () => {
    const user = buildPersistedUser({ id: 'user_1', email: 'old@example.com' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(buildEmailChangeOtpRecord());
    const useCase = new ConfirmEmailChangeUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
    );

    try {
      await useCase.execute({ userId: 'user_1', newEmail: 'new@example.com', otp: '000000' });
      expect.fail('Expected execute() to throw OtpInvalidError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpInvalidError);
    }
    expect(userRepository.updateEmailCalls).to.have.length(0);
  });

  it('rejects an expired code', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(buildEmailChangeOtpRecord({ expiresAt: new Date(Date.now() - 1) }));
    const useCase = new ConfirmEmailChangeUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
    );

    try {
      await useCase.execute({ userId: 'user_1', newEmail: 'new@example.com', otp: validOtp });
      expect.fail('Expected execute() to throw OtpExpiredError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpExpiredError);
    }
    expect(userRepository.updateEmailCalls).to.have.length(0);
  });

  it('throws OtpNotFoundError when the record belongs to a different user', async () => {
    const user = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({ existingUserById: user });
    const otpRepository = new FakeOtpRepository();
    otpRepository.seed(buildEmailChangeOtpRecord({ userId: 'someone_else' }));
    const useCase = new ConfirmEmailChangeUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService(validOtp),
    );

    try {
      await useCase.execute({ userId: 'user_1', newEmail: 'new@example.com', otp: validOtp });
      expect.fail('Expected execute() to throw OtpNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(OtpNotFoundError);
    }
  });
});
