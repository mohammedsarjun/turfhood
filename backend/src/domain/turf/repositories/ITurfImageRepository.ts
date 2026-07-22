import type { TurfImage } from '../entities/TurfImage.js';

export interface ITurfImageRepository {
  createMany(turfId: string, images: { url: string; isCover: boolean }[]): Promise<TurfImage[]>;
}
