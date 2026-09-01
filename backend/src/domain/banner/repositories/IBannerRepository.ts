import type { Banner } from '../entities/Banner.js';

export interface IBannerRepository {
  create(banner: Banner): Promise<Banner>;
  findAll(): Promise<Banner[]>;
  findById(id: string): Promise<Banner | null>;
  delete(id: string): Promise<boolean>;
}
