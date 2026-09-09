import { injectable } from 'tsyringe';
import { TurfImage } from '@domain/turf/entities/TurfImage';
import type { ITurfImageRepository } from '@domain/turf/repositories/ITurfImageRepository';

import { TurfImageModel, type TurfImageDocument } from '../models/TurfImageModel.js';

@injectable()
export class TurfImageRepository implements ITurfImageRepository {
  async replaceAll(turfId: string, images: { url: string; isCover: boolean }[]): Promise<void> {
    const session = await TurfImageModel.startSession();
    try {
      await session.withTransaction(async () => {
        await TurfImageModel.deleteMany({ turfId }).session(session);
        await TurfImageModel.insertMany(
          images.map((image, order) => ({ turfId, ...image, order })),
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }
  async replaceCover(turfId: string, url: string): Promise<void> {
    await TurfImageModel.updateMany({ turfId }, { $set: { isCover: false } });
    const current = await TurfImageModel.findOne({ turfId, url });
    if (current) {
      current.isCover = true;
      current.order = 0;
      await current.save();
      return;
    }
    await TurfImageModel.create({ turfId, url, isCover: true, order: 0 });
  }
  async findImageUrls(turfIds: string[]): Promise<Map<string, string[]>> {
    const documents = await TurfImageModel.find({ turfId: { $in: turfIds } }).sort({
      isCover: -1,
      order: 1,
    });
    const urls = new Map<string, string[]>();
    for (const document of documents) {
      const turfId = document.turfId.toString();
      urls.set(turfId, [...(urls.get(turfId) ?? []), document.url]);
    }
    return urls;
  }

  async findCoverUrls(turfIds: string[]): Promise<Map<string, string>> {
    const documents = await TurfImageModel.find({ turfId: { $in: turfIds } }).sort({
      isCover: -1,
      order: 1,
    });
    const urls = new Map<string, string>();
    for (const document of documents) {
      const turfId = document.turfId.toString();
      if (!urls.has(turfId)) urls.set(turfId, document.url);
    }
    return urls;
  }

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
