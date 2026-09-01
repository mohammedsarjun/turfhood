import { expect } from 'chai';
import { ManageBannersUseCase } from '../../../src/application/banner/use-cases/ManageBannersUseCase.js';
import { Banner } from '../../../src/domain/banner/entities/Banner.js';
import type { IBannerRepository } from '../../../src/domain/banner/repositories/IBannerRepository.js';
import type {
  IFileStorageService,
  UploadFileParams,
} from '../../../src/domain/shared/services/IFileStorageService.js';

class FakeBannerRepository implements IBannerRepository {
  items: Banner[] = [];
  async create(banner: Banner) {
    const saved = Banner.fromPersistence({
      id: 'banner-1',
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      createdAt: new Date('2026-01-01'),
    });
    this.items.push(saved);
    return saved;
  }
  async findAll() {
    return this.items;
  }
  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }
  async delete(id: string) {
    const count = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < count;
  }
}

class FakeFileStorage implements IFileStorageService {
  deleted: string[] = [];
  async upload(_params: UploadFileParams) {
    return { url: 'https://cdn.test/banner.webp' };
  }
  async delete(url: string) {
    this.deleted.push(url);
  }
}

describe('ManageBannersUseCase', () => {
  it('uploads, stores, lists, and deletes a banner', async () => {
    const repository = new FakeBannerRepository();
    const storage = new FakeFileStorage();
    const useCase = new ManageBannersUseCase(repository, storage);
    const created = await useCase.create({
      title: ' Play nearby ',
      description: ' Find a great turf ',
      image: {
        buffer: Buffer.from('image'),
        filename: 'banner.webp',
        mimeType: 'image/webp',
        size: 5,
      },
    });
    expect(created.title).to.equal('Play nearby');
    expect(await useCase.list()).to.have.length(1);
    expect(await useCase.delete(created.id)).to.equal(true);
    expect(storage.deleted).to.deep.equal(['https://cdn.test/banner.webp']);
  });
});
