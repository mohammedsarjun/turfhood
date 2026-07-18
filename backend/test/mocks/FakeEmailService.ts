import type { IEmailService, SendOtpEmailParams } from '../../src/domain/otp/services/IEmailService.js';

/**
 * In-memory stand-in for ResendEmailService. Records every "sent" email so
 * tests can assert on it — never calls the real Resend API.
 */
export class FakeEmailService implements IEmailService {
  public readonly sentEmails: SendOtpEmailParams[] = [];

  async sendOtpEmail(params: SendOtpEmailParams): Promise<void> {
    this.sentEmails.push(params);
  }
}
