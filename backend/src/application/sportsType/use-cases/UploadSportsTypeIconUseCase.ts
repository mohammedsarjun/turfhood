import { inject, injectable } from 'tsyringe';
import { InvalidSportsTypeIconFileError } from '@domain/sportsType/errors/InvalidSportsTypeIconFileError';
import { SportsTypeNotFoundError } from '@domain/sportsType/errors/SportsTypeNotFoundError';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import type { CatalogItem } from '@turfhood/shared';
import { env } from '@config/env';

import type { UploadSportsTypeIconRequestDTO } from '../dtos/UploadSportsTypeIconRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IUploadSportsTypeIconUseCase } from './IUploadSportsTypeIconUseCase.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Replaces a sport's icon. File type/size are re-validated here — never trust client-side
 * checks alone. The previous icon (if any) is best-effort deleted after the new one is
 * persisted, mirroring UpdateAvatarUseCase.
 */
@injectable()
export class UploadSportsTypeIconUseCase implements IUploadSportsTypeIconUseCase {
  constructor(
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository)
    private readonly sportsTypeRepository: ISportsTypeRepository,
    @inject(SHARED_TOKENS.FileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(request: UploadSportsTypeIconRequestDTO): Promise<CatalogItem> {
    if (!ALLOWED_MIME_TYPES.has(request.mimeType)) {
      throw new InvalidSportsTypeIconFileError('Only JPEG, PNG, or WEBP images are allowed.');
    }
    if (request.sizeBytes > MAX_SIZE_BYTES) {
      throw new InvalidSportsTypeIconFileError('Image must be 5MB or smaller.');
    }

    const sportsType = await this.sportsTypeRepository.findById(request.id);
    if (!sportsType) {
      throw new SportsTypeNotFoundError();
    }
    const previousIconUrl = sportsType.icon;

    const { url } = await this.fileStorageService.upload({
      buffer: request.buffer,
      filename: request.filename,
      mimeType: request.mimeType,
      folder: env.CLOUDINARY_SPORTS_ICON_FOLDER,
    });

    const updated = await this.sportsTypeRepository.update(request.id, { icon: url });
    if (!updated) {
      throw new SportsTypeNotFoundError();
    }

    if (previousIconUrl) {
      await this.fileStorageService.delete(previousIconUrl).catch(() => undefined);
    }

    return toCatalogItemDTO(updated);
  }
}
