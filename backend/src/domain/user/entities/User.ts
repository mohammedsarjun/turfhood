import type { Email } from '../value-objects/Email.js';
import type { Phone } from '../value-objects/Phone.js';

export type AuthProvider = 'email' | 'phone_otp' | 'google';
export type UserRole = 'customer' | 'admin' | 'turf_owner';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface UserProps {
  id?: string;
  name: string;
  email: Email;
  phone?: Phone;
  passwordHash: string;
  authProviders: AuthProvider[];
  roles: UserRole[];
  isVerified: boolean;
  status: UserStatus;
  googleId?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Core User entity — mirrors the `users` collection's business-relevant fields. */
export class User {
  private constructor(private readonly props: UserProps) {}

  /** Registers a brand-new email/password user with signup defaults. */
  static register(input: { name: string; email: Email; phone: Phone; passwordHash: string }): User {
    return new User({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      authProviders: ['email'],
      roles: ['customer'],
      isVerified: false,
      status: 'active',
    });
  }

  /**
   * Registers a brand-new user from a verified Google profile. No password/phone is collected —
   * `passwordHash` stays `''` (the repository already treats a missing hash this way) and `phone`
   * stays unset. `isVerified: true` because Google has already proven ownership of the email.
   */
  static registerViaGoogle(input: {
    name: string;
    email: Email;
    googleId: string;
    avatarUrl?: string;
  }): User {
    return new User({
      name: input.name,
      email: input.email,
      passwordHash: '',
      authProviders: ['google'],
      roles: ['customer'],
      isVerified: true,
      status: 'active',
      googleId: input.googleId,
      ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
    });
  }

  /** Rehydrates a User entity from persisted data. */
  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get phone(): Phone | undefined {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get authProviders(): AuthProvider[] {
    return this.props.authProviders;
  }

  get roles(): UserRole[] {
    return this.props.roles;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get googleId(): string | undefined {
    return this.props.googleId;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
