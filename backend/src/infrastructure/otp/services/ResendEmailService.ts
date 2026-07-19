import { Resend } from 'resend';
import { injectable } from 'tsyringe';
import type {
  IEmailService,
  SendOtpEmailParams,
  SendPasswordResetEmailParams,
} from '@domain/otp/services/IEmailService';
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

  async sendPasswordResetEmail({
    to,
    resetLink,
    expiresInSeconds,
  }: SendPasswordResetEmailParams): Promise<void> {
    const expiresInMinutes = Math.round(expiresInSeconds / 60);
    const { error } = await this.resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject: 'Reset your Turfhood password',
      html: `<p>We received a request to reset your Turfhood password. <a href="${resetLink}">Click here to choose a new password</a>. This link expires in ${expiresInMinutes} minutes.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });
    if (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
}
