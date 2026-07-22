import type { User, UserRole } from '../entities/User.js';
import type { Email } from '../value-objects/Email.js';
import type { Phone } from '../value-objects/Phone.js';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phone: Phone): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  create(user: User): Promise<User>;
  markVerified(email: Email): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  linkGoogleAccount(userId: string, googleId: string, avatarUrl?: string): Promise<void>;
  updateName(userId: string, name: string): Promise<void>;
  updatePhone(userId: string, phone: Phone): Promise<void>;
  updateEmail(userId: string, email: Email): Promise<void>;
  updateAvatarUrl(userId: string, avatarUrl: string): Promise<void>;
  /** Sets a password on an account that previously had none (e.g. a Google-only account). */
  addPasswordAuth(userId: string, passwordHash: string): Promise<void>;
  /** Grants an additional role (e.g. 'turf_owner') without removing existing ones. */
  addRole(userId: string, role: UserRole): Promise<void>;
}
