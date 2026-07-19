import { expect } from 'chai';
import { RequestEmailChangeUseCase } from '../../../src/application/user/use-cases/RequestEmailChangeUseCase.js';
import { DuplicateEmailError } from '../../../src/domain/user/errors/DuplicateEmailError.js';
import { GoogleAccountEmailChangeNotAllowedError } from '../../../src/domain/user/errors/GoogleAccountEmailChangeNotAllowedError.js';
import { FakeUserRepository } from '../../mocks/FakeUserRepository.js';
import { FakeOtpRepository } from '../../mocks/FakeOtpRepository.js';
import { FakeOtpService } from '../../mocks/FakeOtpService.js';
import { FakeEmailService } from '../../mocks/FakeEmailService.js';
import { FakeOtpSessionTokenService } from '../../mocks/FakeOtpSessionTokenService.js';
import { buildGoogleOnlyUser, buildPersistedUser } from '../../fixtures/users.fixture.js';
import { Email } from '../../../src/domain/user/value-objects/Email.js';

describe('RequestEmailChangeUseCase', () => {
  it('generates a code, sends it to the new address, and issues a session token', async () => {
    const requestingUser = buildPersistedUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({
      existingUserById: requestingUser,
      existingUserByEmail: null,
    });
    const otpRepository = new FakeOtpRepository();
    const emailService = new FakeEmailService();
    const useCase = new RequestEmailChangeUseCase(
      userRepository,
      otpRepository,
      new FakeOtpService('123456'),
      emailService,
      new FakeOtpSessionTokenService(),
    );

    const result = await useCase.execute({ userId: 'user_1', newEmail: 'new@example.com' });

    expect(result.otpSessionToken).to.be.a('string').that.is.not.empty;
    expect(emailService.sentEmails).to.have.length(1);
    expect(emailService.sentEmails[0]?.to).to.equal('new@example.com');
    expect(emailService.sentEmails[0]?.purpose).to.equal('email_change');

    const record = await otpRepository.findLatestActiveByEmail(
      Email.create('new@example.com'),
      'email_change',
    );
    expect(record?.userId).to.equal('user_1');
  });

  it('throws DuplicateEmailError when the new email already belongs to another account', async () => {
    const requestingUser = buildPersistedUser({ id: 'user_1' });
    const existing = buildPersistedUser({ id: 'user_2', email: 'new@example.com' });
    const userRepository = new FakeUserRepository({
      existingUserById: requestingUser,
      existingUserByEmail: existing,
    });
    const useCase = new RequestEmailChangeUseCase(
      userRepository,
      new FakeOtpRepository(),
      new FakeOtpService(),
      new FakeEmailService(),
      new FakeOtpSessionTokenService(),
    );

    try {
      await useCase.execute({ userId: 'user_1', newEmail: 'new@example.com' });
      expect.fail('Expected execute() to throw DuplicateEmailError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(DuplicateEmailError);
    }
  });

  it('throws GoogleAccountEmailChangeNotAllowedError for a Google-linked account', async () => {
    const requestingUser = buildGoogleOnlyUser({ id: 'user_1' });
    const userRepository = new FakeUserRepository({
      existingUserById: requestingUser,
      existingUserByEmail: null,
    });
    const emailService = new FakeEmailService();
    const useCase = new RequestEmailChangeUseCase(
      userRepository,
      new FakeOtpRepository(),
      new FakeOtpService(),
      emailService,
      new FakeOtpSessionTokenService(),
    );

    try {
      await useCase.execute({ userId: 'user_1', newEmail: 'new@example.com' });
      expect.fail(
        'Expected execute() to throw GoogleAccountEmailChangeNotAllowedError, but it did not throw.',
      );
    } catch (error) {
      expect(error).to.be.instanceOf(GoogleAccountEmailChangeNotAllowedError);
    }
    expect(emailService.sentEmails).to.have.length(0);
  });
});
