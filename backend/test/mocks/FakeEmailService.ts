import type {
  IEmailService,
  SendOtpEmailParams,
  SendPasswordResetEmailParams,
} from '../../src/domain/otp/services/IEmailService.js';

/**
 * In-memory stand-in for ResendEmailService. Records every "sent" email so
 * tests can assert on it — never calls the real Resend API.
 */
export class FakeEmailService implements IEmailService {
  public readonly sentEmails: SendOtpEmailParams[] = [];
  public readonly sentPasswordResetEmails: SendPasswordResetEmailParams[] = [];
  public readonly sentBookingConfirmations: Array<{ to: string; reference: string }> = [];

  async sendOtpEmail(params: SendOtpEmailParams): Promise<void> {
    this.sentEmails.push(params);
  }

  async sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<void> {
    this.sentPasswordResetEmails.push(params);
  }

  async sendBookingConfirmationEmail(params: {
    to: string;
    reference: string;
    turfName: string;
    courtName: string;
    date: string;
    times: string;
    amount: string;
    address: string;
  }): Promise<void> {
    this.sentBookingConfirmations.push({ to: params.to, reference: params.reference });
  }
}
