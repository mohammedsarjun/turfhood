import { inject, injectable } from 'tsyringe';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';

import type { UpdateNameRequestDTO } from '../dtos/UpdateNameRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { IUpdateNameUseCase } from './IUpdateNameUseCase.js';

/** Updates the authenticated user's display name directly — no verification step required. */
@injectable()
export class UpdateNameUseCase implements IUpdateNameUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: UpdateNameRequestDTO): Promise<UserResponseDTO> {
    const name = request.name.trim();

    await this.userRepository.updateName(request.userId, name);

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return toUserResponseDTO(user);
  }
}
