import { injectable } from 'tsyringe';
import { User } from '@domain/user/entities/User';
import { DuplicateEmailError } from '@domain/user/errors/DuplicateEmailError';
import { DuplicatePhoneError } from '@domain/user/errors/DuplicatePhoneError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { Email } from '@domain/user/value-objects/Email';
import { Phone } from '@domain/user/value-objects/Phone';

import { UserModel, type UserDocument } from '../models/UserModel.js';

function isDuplicateKeyError(
  error: unknown,
): error is { code: number; keyPattern?: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 11000
  );
}

@injectable()
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toString() }).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async findByPhone(phone: Phone): Promise<User | null> {
    const doc = await UserModel.findOne({ phone: phone.toString() }).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ googleId }).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async create(user: User): Promise<User> {
    try {
      const doc = await UserModel.create({
        name: user.name,
        email: user.email.toString(),
        phone: user.phone?.toString(),
        passwordHash: user.passwordHash,
        authProviders: user.authProviders,
        roles: user.roles,
        isVerified: user.isVerified,
        status: user.status,
        googleId: user.googleId,
        avatarUrl: user.avatarUrl,
      });
      return this.toDomain(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        if (error.keyPattern && 'phone' in error.keyPattern) {
          throw new DuplicatePhoneError(user.phone?.toString() ?? '');
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

  async linkGoogleAccount(userId: string, googleId: string, avatarUrl?: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { googleId, ...(avatarUrl ? { avatarUrl } : {}) },
        $addToSet: { authProviders: 'google' },
      },
    );
  }

  async updateName(userId: string, name: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { name } });
  }

  async updatePhone(userId: string, phone: Phone): Promise<void> {
    try {
      await UserModel.updateOne({ _id: userId }, { $set: { phone: phone.toString() } });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new DuplicatePhoneError(phone.toString());
      }
      throw error;
    }
  }

  async updateEmail(userId: string, email: Email): Promise<void> {
    try {
      await UserModel.updateOne({ _id: userId }, { $set: { email: email.toString() } });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new DuplicateEmailError(email.toString());
      }
      throw error;
    }
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { avatarUrl } });
  }

  async addPasswordAuth(userId: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { passwordHash }, $addToSet: { authProviders: 'email' } },
    );
  }

  private toDomain(doc: UserDocument): User {
    return User.fromPersistence({
      id: doc._id.toString(),
      name: doc.name,
      email: Email.create(doc.email as string),
      ...(doc.phone ? { phone: Phone.create(doc.phone) } : {}),
      passwordHash: doc.passwordHash ?? '',
      authProviders: doc.authProviders,
      roles: doc.roles,
      isVerified: doc.isVerified,
      status: doc.status,
      ...(doc.googleId ? { googleId: doc.googleId } : {}),
      ...(doc.avatarUrl ? { avatarUrl: doc.avatarUrl } : {}),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
