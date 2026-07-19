import { inject, injectable } from 'tsyringe';
import { InvalidAvatarFileError } from '@domain/user/errors/InvalidAvatarFileError';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IFileStorageService } from '@domain/user/services/IFileStorageService';
import { USER_TOKENS } from '@domain/user/tokens';

import type { UpdateAvatarRequestDTO } from '../dtos/UpdateAvatarRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { IUpdateAvatarUseCase } from './IUpdateAvatarUseCase.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Replaces the authenticated user's avatar. File type/size are re-validated here — never trust
 * client-side checks alone. The previous avatar (if any) is best-effort deleted after the new
 * one is persisted.
 */
@injectable()
export class UpdateAvatarUseCase implements IUpdateAvatarUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.FileStorageService) private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(request: UpdateAvatarRequestDTO): Promise<UserResponseDTO> {
    if (!ALLOWED_MIME_TYPES.has(request.mimeType)) {
      throw new InvalidAvatarFileError('Only JPEG, PNG, or WEBP images are allowed.');
    }
    if (request.sizeBytes > MAX_SIZE_BYTES) {
      throw new InvalidAvatarFileError('Image must be 5MB or smaller.');
    }

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    const previousAvatarUrl = user.avatarUrl;

    const { url } = await this.fileStorageService.upload({
      buffer: request.buffer,
      filename: request.filename,
      mimeType: request.mimeType,
    });

    await this.userRepository.updateAvatarUrl(request.userId, url);

    if (previousAvatarUrl) {
      await this.fileStorageService.delete(previousAvatarUrl).catch(() => undefined);
    }

    const updatedUser = await this.userRepository.findById(request.userId);
    if (!updatedUser) {
      throw new UserNotFoundError();
    }
    return toUserResponseDTO(updatedUser);
  }
}
