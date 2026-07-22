import { TurfImage } from '../../src/domain/turf/entities/TurfImage.js';
import type { ITurfImageRepository } from '../../src/domain/turf/repositories/ITurfImageRepository.js';

/** In-memory stand-in for the real Mongo-backed TurfImageRepository. */
export class FakeTurfImageRepository implements ITurfImageRepository {
  public readonly createManyCalls: Array<{
    turfId: string;
    images: { url: string; isCover: boolean }[];
  }> = [];

  async createMany(
    turfId: string,
    images: { url: string; isCover: boolean }[],
  ): Promise<TurfImage[]> {
    this.createManyCalls.push({ turfId, images });
    return images.map((image, index) =>
      TurfImage.create({ turfId, url: image.url, isCover: image.isCover, order: index }),
    );
  }
}
