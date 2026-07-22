import { inject, injectable } from 'tsyringe';
import { InvalidAmenityIconFileError } from '@domain/amenity/errors/InvalidAmenityIconFileError';
import { Amenity } from '@domain/amenity/entities/Amenity';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import type { CatalogItem } from '@turfhood/shared';
import { env } from '@config/env';

import type { CreateAmenityRequestDTO } from '../dtos/CreateAmenityRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { ICreateAmenityUseCase } from './ICreateAmenityUseCase.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Creates a new amenity. An icon image is mandatory — type/size are re-validated here, never trust client-side checks alone. */
@injectable()
export class CreateAmenityUseCase implements ICreateAmenityUseCase {
  constructor(
    @inject(AMENITY_TOKENS.AmenityRepository)
    private readonly amenityRepository: IAmenityRepository,
    @inject(SHARED_TOKENS.FileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(request: CreateAmenityRequestDTO): Promise<CatalogItem> {
    if (!ALLOWED_MIME_TYPES.has(request.iconMimeType)) {
      throw new InvalidAmenityIconFileError('Only JPEG, PNG, or WEBP images are allowed.');
    }
    if (request.iconSizeBytes > MAX_SIZE_BYTES) {
      throw new InvalidAmenityIconFileError('Image must be 5MB or smaller.');
    }

    const name = request.name.trim();

    const { url } = await this.fileStorageService.upload({
      buffer: request.iconBuffer,
      filename: request.iconFilename,
      mimeType: request.iconMimeType,
      folder: env.CLOUDINARY_AMENITY_ICON_FOLDER,
    });

    const amenity = Amenity.create({ name, icon: url });
    const created = await this.amenityRepository.create(amenity);

    return toCatalogItemDTO(created);
  }
}
