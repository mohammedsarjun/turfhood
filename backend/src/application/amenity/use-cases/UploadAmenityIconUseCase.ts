import { inject, injectable } from 'tsyringe';
import { InvalidAmenityIconFileError } from '@domain/amenity/errors/InvalidAmenityIconFileError';
import { AmenityNotFoundError } from '@domain/amenity/errors/AmenityNotFoundError';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import type { CatalogItem } from '@turfhood/shared';
import { env } from '@config/env';

import type { UploadAmenityIconRequestDTO } from '../dtos/UploadAmenityIconRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IUploadAmenityIconUseCase } from './IUploadAmenityIconUseCase.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Replaces an amenity's icon. File type/size are re-validated here — never trust client-side
 * checks alone. The previous icon (if any) is best-effort deleted after the new one is
 * persisted, mirroring UpdateAvatarUseCase.
 */
@injectable()
export class UploadAmenityIconUseCase implements IUploadAmenityIconUseCase {
  constructor(
    @inject(AMENITY_TOKENS.AmenityRepository)
    private readonly amenityRepository: IAmenityRepository,
    @inject(SHARED_TOKENS.FileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(request: UploadAmenityIconRequestDTO): Promise<CatalogItem> {
    if (!ALLOWED_MIME_TYPES.has(request.mimeType)) {
      throw new InvalidAmenityIconFileError('Only JPEG, PNG, or WEBP images are allowed.');
    }
    if (request.sizeBytes > MAX_SIZE_BYTES) {
      throw new InvalidAmenityIconFileError('Image must be 5MB or smaller.');
    }

    const amenity = await this.amenityRepository.findById(request.id);
    if (!amenity) {
      throw new AmenityNotFoundError();
    }
    const previousIconUrl = amenity.icon;

    const { url } = await this.fileStorageService.upload({
      buffer: request.buffer,
      filename: request.filename,
      mimeType: request.mimeType,
      folder: env.CLOUDINARY_AMENITY_ICON_FOLDER,
    });

    const updated = await this.amenityRepository.update(request.id, { icon: url });
    if (!updated) {
      throw new AmenityNotFoundError();
    }

    if (previousIconUrl) {
      await this.fileStorageService.delete(previousIconUrl).catch(() => undefined);
    }

    return toCatalogItemDTO(updated);
  }
}
