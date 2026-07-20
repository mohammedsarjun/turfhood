import { inject, injectable } from 'tsyringe';
import { InvalidSportsTypeIconFileError } from '@domain/sportsType/errors/InvalidSportsTypeIconFileError';
import { SportsType } from '@domain/sportsType/entities/SportsType';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import type { CatalogItem } from '@turfhood/shared';
import { env } from '@config/env';

import type { CreateSportsTypeRequestDTO } from '../dtos/CreateSportsTypeRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { ICreateSportsTypeUseCase } from './ICreateSportsTypeUseCase.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Creates a new sport. An icon image is mandatory — type/size are re-validated here, never trust client-side checks alone. */
@injectable()
export class CreateSportsTypeUseCase implements ICreateSportsTypeUseCase {
  constructor(
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository)
    private readonly sportsTypeRepository: ISportsTypeRepository,
    @inject(SHARED_TOKENS.FileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(request: CreateSportsTypeRequestDTO): Promise<CatalogItem> {
    if (!ALLOWED_MIME_TYPES.has(request.iconMimeType)) {
      throw new InvalidSportsTypeIconFileError('Only JPEG, PNG, or WEBP images are allowed.');
    }
    if (request.iconSizeBytes > MAX_SIZE_BYTES) {
      throw new InvalidSportsTypeIconFileError('Image must be 5MB or smaller.');
    }

    const name = request.name.trim();

    const { url } = await this.fileStorageService.upload({
      buffer: request.iconBuffer,
      filename: request.iconFilename,
      mimeType: request.iconMimeType,
      folder: env.CLOUDINARY_SPORTS_ICON_FOLDER,
    });

    const sportsType = SportsType.create({ name, icon: url });
    const created = await this.sportsTypeRepository.create(sportsType);

    return toCatalogItemDTO(created);
  }
}
