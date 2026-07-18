export interface PasswordResetTokenProps {
  id?: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt?: Date;
}

/** Core PasswordResetToken entity */
export class PasswordResetToken {
  private constructor(private readonly props: PasswordResetTokenProps) {}

  /** Issues a brand-new, unconsumed reset token record. */
  static issue(input: { userId: string; tokenHash: string; expiresAt: Date }): PasswordResetToken {
    return new PasswordResetToken({ ...input });
  }

  /** Rehydrates a PasswordResetToken entity from persisted data. */
  static fromPersistence(props: PasswordResetTokenProps): PasswordResetToken {
    return new PasswordResetToken(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get consumedAt(): Date | undefined {
    return this.props.consumedAt;
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
}
