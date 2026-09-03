import { injectable } from 'tsyringe';
import { Banner } from '@domain/banner/entities/Banner';
import type { IBannerRepository } from '@domain/banner/repositories/IBannerRepository';

import { BannerModel, type BannerDocument } from '../models/BannerModel.js';

@injectable()
export class BannerRepository implements IBannerRepository {
  async create(banner: Banner): Promise<Banner> {
    return this.toDomain(
      await BannerModel.create({
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
      }),
    );
  }

  async findAll(): Promise<Banner[]> {
    const documents = await BannerModel.find().sort({ createdAt: -1 });
    return documents.map((document) => this.toDomain(document));
  }

  async findById(id: string): Promise<Banner | null> {
    if (!id.match(/^[a-f\d]{24}$/i)) return null;
    const document = await BannerModel.findById(id);
    return document ? this.toDomain(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!id.match(/^[a-f\d]{24}$/i)) return false;
    return Boolean(await BannerModel.findByIdAndDelete(id));
  }

  private toDomain(document: BannerDocument): Banner {
    return Banner.fromPersistence({
      id: document._id.toString(),
      title: document.title,
      description: document.description,
      imageUrl: document.imageUrl,
      createdAt: document.createdAt,
    });
  }
}
