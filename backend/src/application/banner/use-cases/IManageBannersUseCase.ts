import type { BannerDTO } from '@turfhood/shared';

export interface CreateBannerInput {
  title: string;
  description: string;
  image: { buffer: Buffer; filename: string; mimeType: string; size: number };
}

export interface IManageBannersUseCase {
  list(): Promise<BannerDTO[]>;
  create(input: CreateBannerInput): Promise<BannerDTO>;
  delete(id: string): Promise<boolean>;
}
