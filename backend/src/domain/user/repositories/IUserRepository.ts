import type { User } from '../entities/User.js';
import type { Email } from '../value-objects/Email.js';
import type { Phone } from '../value-objects/Phone.js';

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phone: Phone): Promise<User | null>;
  create(user: User): Promise<User>;
  markVerified(email: Email): Promise<void>;
}
