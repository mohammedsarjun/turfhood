import bcrypt from 'bcryptjs';
import { injectable } from 'tsyringe';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';

const SALT_ROUNDS = 10;

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
