import { injectable } from 'tsyringe';
import { SportsType } from '@domain/sportsType/entities/SportsType';
import { DuplicateSportsTypeNameError } from '@domain/sportsType/errors/DuplicateSportsTypeNameError';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { MongooseListedCatalogRepository } from '@infrastructure/shared/repositories/MongooseListedCatalogRepository';

import { SportsTypeModel, type SportsTypeDocument } from '../models/SportsTypeModel.js';

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 11000
  );
}

@injectable()
export class SportsTypeRepository
  extends MongooseListedCatalogRepository<SportsTypeDocument, SportsType>
  implements ISportsTypeRepository
{
  protected readonly model = SportsTypeModel;

  async create(sportsType: SportsType): Promise<SportsType> {
    try {
      const doc = await SportsTypeModel.create({
        name: sportsType.name,
        icon: sportsType.icon,
        isListed: sportsType.isListed,
      });
      return this.toDomain(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new DuplicateSportsTypeNameError(sportsType.name);
      }
      throw error;
    }
  }

  async update(id: string, changes: { name?: string; icon?: string }): Promise<SportsType | null> {
    try {
      const doc = await SportsTypeModel.findByIdAndUpdate(id, { $set: changes }, { new: true });
      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      if (isDuplicateKeyError(error) && changes.name) {
        throw new DuplicateSportsTypeNameError(changes.name);
      }
      throw error;
    }
  }

  protected toDomain(doc: SportsTypeDocument): SportsType {
    return SportsType.fromPersistence({
      id: doc._id.toString(),
      name: doc.name,
      ...(doc.icon ? { icon: doc.icon } : {}),
      isListed: doc.isListed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
