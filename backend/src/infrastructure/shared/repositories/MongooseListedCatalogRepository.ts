import type { Document, FilterQuery, Model } from 'mongoose';

export interface ListedCatalogDocument extends Document {
  name: string;
  icon?: string;
  isListed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListedCatalogListParams {
  page: number;
  limit: number;
  search?: string;
  isListed?: boolean;
}

export interface ListedCatalogListResult<TEntity> {
  items: TEntity[];
  total: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Shared Mongoose query-building for catalog-shaped collections (name + icon? + isListed).
 * Sports types and amenities are structurally identical at the persistence level, so the
 * skip/limit/search/toggle plumbing lives here once; each concrete repository still owns its
 * own Model, domain interface, and create/update mapping.
 */
export abstract class MongooseListedCatalogRepository<TDoc extends ListedCatalogDocument, TEntity> {
  protected abstract readonly model: Model<TDoc>;
  protected abstract toDomain(doc: TDoc): TEntity;

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByName(name: string): Promise<TEntity | null> {
    const doc = await this.model.findOne({ name });
    return doc ? this.toDomain(doc) : null;
  }

  async list(params: ListedCatalogListParams): Promise<ListedCatalogListResult<TEntity>> {
    const filter: Record<string, unknown> = {};
    if (params.search) {
      filter.name = { $regex: escapeRegExp(params.search), $options: 'i' };
    }
    if (params.isListed !== undefined) {
      filter.isListed = params.isListed;
    }

    const skip = (params.page - 1) * params.limit;
    const [docs, total] = await Promise.all([
      this.model
        .find(filter as FilterQuery<TDoc>)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit),
      this.model.countDocuments(filter as FilterQuery<TDoc>),
    ]);

    return { items: docs.map((doc) => this.toDomain(doc)), total };
  }

  async setListed(id: string, isListed: boolean): Promise<TEntity | null> {
    const doc = await this.model.findByIdAndUpdate(id, { $set: { isListed } }, { new: true });
    return doc ? this.toDomain(doc) : null;
  }
}
