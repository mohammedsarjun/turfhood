import { inject, injectable } from 'tsyringe';
import { User } from '@domain/user/entities/User';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import { Password } from '@domain/user/value-objects/Password';

import type { SeedAdminRequestDTO } from '../dtos/SeedAdminRequestDTO.js';

import type { ISeedAdminUseCase } from './ISeedAdminUseCase.js';

/**
 * Idempotently seeds the single admin account on server startup. If a user already exists
 * with the configured admin email — admin or not — seeding is skipped entirely; it never
 * creates a duplicate and never mutates/promotes an existing account.
 */
@injectable()
export class SeedAdminUseCase implements ISeedAdminUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(request: SeedAdminRequestDTO): Promise<void> {
    const email = Email.create(request.email);
    const password = Password.create(request.password);

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return;
    }

    const passwordHash = await this.passwordHasher.hash(password.getPlainValue());
    const admin = User.registerAdmin({ name: request.name, email, passwordHash });
    await this.userRepository.create(admin);
  }
}
