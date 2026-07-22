export interface RefreshTokenProps {
  id?: string;
  userId: string;
  jti: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByJti?: string;
  createdAt?: Date;
}

/** Tracks an issued refresh-token JWT's revocation state — the JWT itself carries the `jti`. */
export class RefreshToken {
  private constructor(private readonly props: RefreshTokenProps) {}

  /** Issues a brand-new, unrevoked refresh-token record. */
  static issue(input: { userId: string; jti: string; expiresAt: Date }): RefreshToken {
    return new RefreshToken({ ...input });
  }

  /** Rehydrates a RefreshToken entity from persisted data. */
  static fromPersistence(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get jti(): string {
    return this.props.jti;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | undefined {
    return this.props.revokedAt;
  }

  get replacedByJti(): string | undefined {
    return this.props.replacedByJti;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  isRevoked(): boolean {
    return this.props.revokedAt !== undefined;
  }

  isExpired(now: Date): boolean {
    return now.getTime() > this.props.expiresAt.getTime();
  }
}
