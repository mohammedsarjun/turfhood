import { inject, injectable } from 'tsyringe';
import { CurrentPasswordIncorrectError } from '@domain/user/errors/CurrentPasswordIncorrectError';
import { PasswordNotSetError } from '@domain/user/errors/PasswordNotSetError';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import { USER_TOKENS } from '@domain/user/tokens';
import { Password } from '@domain/user/value-objects/Password';

import type {
  ChangePasswordRequestDTO,
  ChangePasswordResponseDTO,
} from '../dtos/ChangePasswordRequestDTO.js';

import type { IChangePasswordUseCase } from './IChangePasswordUseCase.js';

/** Requires the current password (verified against the stored hash) before setting a new one. */
@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(request: ChangePasswordRequestDTO): Promise<ChangePasswordResponseDTO> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.passwordHash === '') {
      throw new PasswordNotSetError();
    }

    const isCurrentValid = await this.passwordHasher.compare(
      request.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new CurrentPasswordIncorrectError();
    }

    const newPassword = Password.create(request.newPassword);
    const passwordHash = await this.passwordHasher.hash(newPassword.getPlainValue());
    await this.userRepository.updatePassword(request.userId, passwordHash);

    return { message: 'Password changed successfully.' };
  }
}
