import type { TurfImage } from '../entities/TurfImage.js';

export interface ITurfImageRepository {
  createMany(turfId: string, images: { url: string; isCover: boolean }[]): Promise<TurfImage[]>;
  findCoverUrls(turfIds: string[]): Promise<Map<string, string>>;
  findImageUrls(turfIds: string[]): Promise<Map<string, string[]>>;
  replaceCover(turfId: string, url: string): Promise<void>;
  replaceAll(turfId: string, images: { url: string; isCover: boolean }[]): Promise<void>;
}
