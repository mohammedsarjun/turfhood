import { inject, injectable } from 'tsyringe';
import type { BannerDTO } from '@turfhood/shared';
import { Banner } from '@domain/banner/entities/Banner';
import type { IBannerRepository } from '@domain/banner/repositories/IBannerRepository';
import { BANNER_TOKENS } from '@domain/banner/tokens';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

import type { CreateBannerInput, IManageBannersUseCase } from './IManageBannersUseCase.js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

@injectable()
export class ManageBannersUseCase implements IManageBannersUseCase {
  constructor(
    @inject(BANNER_TOKENS.BannerRepository) private readonly banners: IBannerRepository,
    @inject(SHARED_TOKENS.FileStorageService) private readonly files: IFileStorageService,
  ) {}

  async list(): Promise<BannerDTO[]> {
    return (await this.banners.findAll()).map((banner) => this.toDTO(banner));
  }

  async create(input: CreateBannerInput): Promise<BannerDTO> {
    if (!input.title.trim() || !input.description.trim()) {
      throw new AppError('Title and description are required.', HttpStatus.BAD_REQUEST);
    }
    if (!ALLOWED_IMAGE_TYPES.has(input.image.mimeType) || input.image.size > MAX_IMAGE_SIZE) {
      throw new AppError('Use a JPEG, PNG, or WEBP image up to 5MB.', HttpStatus.BAD_REQUEST);
    }
    const uploaded = await this.files.upload({
      buffer: input.image.buffer,
      filename: input.image.filename,
      mimeType: input.image.mimeType,
      folder: 'turfhood/banners',
    });
    try {
      const banner = await this.banners.create(
        Banner.create({
          title: input.title,
          description: input.description,
          imageUrl: uploaded.url,
        }),
      );
      return this.toDTO(banner);
    } catch (error) {
      await this.files.delete(uploaded.url);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const banner = await this.banners.findById(id);
    if (!banner) return false;
    const deleted = await this.banners.delete(id);
    if (deleted) await this.files.delete(banner.imageUrl);
    return deleted;
  }

  private toDTO(banner: Banner): BannerDTO {
    return {
      id: banner.id!,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      createdAt: banner.createdAt!.toISOString(),
    };
  }
}
