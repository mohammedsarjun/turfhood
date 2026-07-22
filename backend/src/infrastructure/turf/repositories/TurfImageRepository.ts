import { injectable } from 'tsyringe';
import { TurfImage } from '@domain/turf/entities/TurfImage';
import type { ITurfImageRepository } from '@domain/turf/repositories/ITurfImageRepository';

import { TurfImageModel, type TurfImageDocument } from '../models/TurfImageModel.js';

@injectable()
export class TurfImageRepository implements ITurfImageRepository {
  async createMany(
    turfId: string,
    images: { url: string; isCover: boolean }[],
  ): Promise<TurfImage[]> {
    const docs = await Promise.all(
      images.map((image, index) =>
        TurfImageModel.create({ turfId, url: image.url, isCover: image.isCover, order: index }),
      ),
    );
    return docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: TurfImageDocument): TurfImage {
    return TurfImage.fromPersistence({
      id: doc._id.toString(),
      turfId: doc.turfId.toString(),
      url: doc.url,
      isCover: doc.isCover,
      order: doc.order,
      createdAt: doc.createdAt,
    });
  }
}
