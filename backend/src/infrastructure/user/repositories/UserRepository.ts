import { injectable } from 'tsyringe';
import { User } from '@domain/user/entities/User';
import { DuplicateEmailError } from '@domain/user/errors/DuplicateEmailError';
import { DuplicatePhoneError } from '@domain/user/errors/DuplicatePhoneError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { Email } from '@domain/user/value-objects/Email';
import { Phone } from '@domain/user/value-objects/Phone';

import { UserModel, type UserDocument } from '../models/UserModel.js';

function isDuplicateKeyError(error: unknown): error is { code: number; keyPattern?: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 11000
  );
}

@injectable()
export class UserRepository implements IUserRepository {
  async findByEmail(email: Email): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toString() }).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async findByPhone(phone: Phone): Promise<User | null> {
    const doc = await UserModel.findOne({ phone: phone.toString() }).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async create(user: User): Promise<User> {
    try {
      const doc = await UserModel.create({
        name: user.name,
        email: user.email.toString(),
        phone: user.phone.toString(),
        passwordHash: user.passwordHash,
        authProviders: user.authProviders,
        roles: user.roles,
        isVerified: user.isVerified,
        status: user.status,
      });
      return this.toDomain(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        if (error.keyPattern && 'phone' in error.keyPattern) {
          throw new DuplicatePhoneError(user.phone.toString());
        }
        throw new DuplicateEmailError(user.email.toString());
      }
      throw error;
    }
  }

  async markVerified(email: Email): Promise<void> {
    await UserModel.updateOne({ email: email.toString() }, { $set: { isVerified: true } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { passwordHash } });
  }

  private toDomain(doc: UserDocument): User {
    return User.fromPersistence({
      id: doc._id.toString(),
      name: doc.name,
      email: Email.create(doc.email as string),
      phone: Phone.create(doc.phone as string),
      passwordHash: doc.passwordHash ?? '',
      authProviders: doc.authProviders,
      roles: doc.roles,
      isVerified: doc.isVerified,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
