import { Resend } from 'resend';
import { injectable } from 'tsyringe';
import type { IEmailService, SendOtpEmailParams } from '@domain/otp/services/IEmailService';
import { env } from '@config/env';

@injectable()
export class ResendEmailService implements IEmailService {
  private readonly resend = new Resend(env.RESEND_API_KEY);

  async sendOtpEmail({ to, otp, expiresInSeconds }: SendOtpEmailParams): Promise<void> {
    // The Resend SDK returns { data, error } instead of throwing on API failures.
    const { error } = await this.resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject: 'Your Turfhood verification code',
      html: `<p>Your verification code is <strong>${otp}</strong>. It expires in ${expiresInSeconds} seconds.</p>`,
    });
    if (error) {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
}
