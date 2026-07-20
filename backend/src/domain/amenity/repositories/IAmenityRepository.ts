import type { Amenity } from '../entities/Amenity.js';

export interface ListAmenitiesParams {
  page: number;
  limit: number;
  search?: string;
  isListed?: boolean;
}

export interface ListAmenitiesResult {
  items: Amenity[];
  total: number;
}

export interface IAmenityRepository {
  findById(id: string): Promise<Amenity | null>;
  findByName(name: string): Promise<Amenity | null>;
  list(params: ListAmenitiesParams): Promise<ListAmenitiesResult>;
  create(amenity: Amenity): Promise<Amenity>;
  update(id: string, changes: { name?: string; icon?: string }): Promise<Amenity | null>;
  setListed(id: string, isListed: boolean): Promise<Amenity | null>;
}
