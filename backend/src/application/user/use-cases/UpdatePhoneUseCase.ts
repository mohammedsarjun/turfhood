import { inject, injectable } from 'tsyringe';
import { DuplicatePhoneError } from '@domain/user/errors/DuplicatePhoneError';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import { Phone } from '@domain/user/value-objects/Phone';

import type { UpdatePhoneRequestDTO } from '../dtos/UpdatePhoneRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { IUpdatePhoneUseCase } from './IUpdatePhoneUseCase.js';

/**
 * Updates the authenticated user's phone number directly. No SMS/OTP verification step —
 * scope decision: nothing requires phone re-verification, matching the trust level of name edits.
 */
@injectable()
export class UpdatePhoneUseCase implements IUpdatePhoneUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: UpdatePhoneRequestDTO): Promise<UserResponseDTO> {
    const phone = Phone.create(request.phone);

    const existing = await this.userRepository.findByPhone(phone);
    if (existing && existing.id !== request.userId) {
      throw new DuplicatePhoneError(phone.toString());
    }

    await this.userRepository.updatePhone(request.userId, phone);

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return toUserResponseDTO(user);
  }
}
