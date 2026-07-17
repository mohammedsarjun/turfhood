import type { OtpPurpose } from '@turfhub/shared';

export interface OtpVerificationProps {
  id?: string;
  userId: string;
  email: string;
  purpose: OtpPurpose;
  otpHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  attemptCount: number;
  createdAt?: Date;
}

/** Core OtpVerification entity */
export class OtpVerification {
  private constructor(private readonly props: OtpVerificationProps) {}

  /** Issues a brand-new OTP record with zero prior attempts. */
  static issue(input: {
    userId: string;
    email: string;
    purpose: OtpPurpose;
    otpHash: string;
    expiresAt: Date;
  }): OtpVerification {
    return new OtpVerification({ ...input, attemptCount: 0 });
  }

  /** Rehydrates an OtpVerification entity from persisted data. */
  static fromPersistence(props: OtpVerificationProps): OtpVerification {
    return new OtpVerification(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get email(): string {
    return this.props.email;
  }

  get purpose(): OtpPurpose {
    return this.props.purpose;
  }

  get otpHash(): string {
    return this.props.otpHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get consumedAt(): Date | undefined {
    return this.props.consumedAt;
  }

  get attemptCount(): number {
    return this.props.attemptCount;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  isConsumed(): boolean {
    return this.props.consumedAt !== undefined;
  }

  isExpired(now: Date): boolean {
    return now.getTime() > this.props.expiresAt.getTime();
  }

  hasExceededMaxAttempts(max: number): boolean {
    return this.props.attemptCount >= max;
  }
}
