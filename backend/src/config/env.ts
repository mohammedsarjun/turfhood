import 'dotenv/config';
import {
  DEFAULT_OTP_EXPIRY_SECONDS,
  DEFAULT_PASSWORD_RESET_EXPIRY_SECONDS,
} from '@turfhood/shared';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGODB_URI: requireEnv('MONGODB_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',
  RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? 'Turfhood <onboarding@resend.dev>',
  OTP_EXPIRY_SECONDS: Number(process.env.OTP_EXPIRY_SECONDS ?? DEFAULT_OTP_EXPIRY_SECONDS),
  OTP_MAX_ATTEMPTS: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  PASSWORD_RESET_TOKEN_EXPIRY_SECONDS: Number(
    process.env.PASSWORD_RESET_TOKEN_EXPIRY_SECONDS ?? DEFAULT_PASSWORD_RESET_EXPIRY_SECONDS,
  ),
};
