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
    const escape = (value: string) =>
      value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
    const { error } = await this.resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: params.to,
      subject: `Booking confirmed - ${params.reference}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1 style="color:#15803d">Your turf is booked!</h1><p>Booking <strong>${escape(params.reference)}</strong> is confirmed.</p><div style="background:#f1f5f9;padding:20px;border-radius:12px"><h2>${escape(params.turfName)} - ${escape(params.courtName)}</h2><p><strong>Date:</strong> ${escape(params.date)}</p><p><strong>Time:</strong> ${escape(params.times)}</p><p><strong>Amount paid:</strong> ${escape(params.amount)}</p><p><strong>Address:</strong> ${escape(params.address)}</p></div><p>Please arrive a few minutes early. Have a great game!</p></div>`,
    });
    if (error) throw new Error(`Failed to send booking confirmation email: ${error.message}`);
  }
}
