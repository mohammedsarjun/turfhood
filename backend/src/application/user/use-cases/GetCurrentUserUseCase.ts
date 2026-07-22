import { inject, injectable } from 'tsyringe';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';

import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { IGetCurrentUserUseCase } from './IGetCurrentUserUseCase.js';

/** Resolves the profile of the user identified by an already-verified JWT payload. */
@injectable()
export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return toUserResponseDTO(user);
  }
}
