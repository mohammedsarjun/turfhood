import { inject, injectable } from 'tsyringe';
import { PasswordAlreadySetError } from '@domain/user/errors/PasswordAlreadySetError';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import { USER_TOKENS } from '@domain/user/tokens';
import { Password } from '@domain/user/value-objects/Password';

import type {
  SetPasswordRequestDTO,
  SetPasswordResponseDTO,
} from '../dtos/SetPasswordRequestDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { ISetPasswordUseCase } from './ISetPasswordUseCase.js';

/** Adds password-based login to an account that has none yet (e.g. a Google-only account). */
@injectable()
export class SetPasswordUseCase implements ISetPasswordUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(request: SetPasswordRequestDTO): Promise<SetPasswordResponseDTO> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.passwordHash !== '') {
      throw new PasswordAlreadySetError();
    }

    const newPassword = Password.create(request.newPassword);
    const passwordHash = await this.passwordHasher.hash(newPassword.getPlainValue());
    await this.userRepository.addPasswordAuth(request.userId, passwordHash);

    const updatedUser = await this.userRepository.findById(request.userId);
    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return {
      message: 'Password set successfully. You can now also log in with your password.',
      user: toUserResponseDTO(updatedUser),
    };
  }
}
