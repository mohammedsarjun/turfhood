import { injectable } from 'tsyringe';
import { Amenity } from '@domain/amenity/entities/Amenity';
import { DuplicateAmenityNameError } from '@domain/amenity/errors/DuplicateAmenityNameError';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import { MongooseListedCatalogRepository } from '@infrastructure/shared/repositories/MongooseListedCatalogRepository';

import { AmenityModel, type AmenityDocument } from '../models/AmenityModel.js';

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 11000
  );
}

@injectable()
export class AmenityRepository
  extends MongooseListedCatalogRepository<AmenityDocument, Amenity>
  implements IAmenityRepository
{
  protected readonly model = AmenityModel;

  async create(amenity: Amenity): Promise<Amenity> {
    try {
      const doc = await AmenityModel.create({
        name: amenity.name,
        icon: amenity.icon,
        isListed: amenity.isListed,
      });
      return this.toDomain(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new DuplicateAmenityNameError(amenity.name);
      }
      throw error;
    }
  }

  async update(id: string, changes: { name?: string; icon?: string }): Promise<Amenity | null> {
    try {
      const doc = await AmenityModel.findByIdAndUpdate(id, { $set: changes }, { new: true });
      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      if (isDuplicateKeyError(error) && changes.name) {
        throw new DuplicateAmenityNameError(changes.name);
      }
      throw error;
    }
  }

  protected toDomain(doc: AmenityDocument): Amenity {
    return Amenity.fromPersistence({
      id: doc._id.toString(),
      name: doc.name,
      ...(doc.icon ? { icon: doc.icon } : {}),
      isListed: doc.isListed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
