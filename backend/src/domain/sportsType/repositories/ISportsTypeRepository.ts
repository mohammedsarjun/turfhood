import type { SportsType } from '../entities/SportsType.js';

export interface ListSportsTypesParams {
  page: number;
  limit: number;
  search?: string;
  isListed?: boolean;
}

export interface ListSportsTypesResult {
  items: SportsType[];
  total: number;
}

export interface ISportsTypeRepository {
  findById(id: string): Promise<SportsType | null>;
  findByName(name: string): Promise<SportsType | null>;
  list(params: ListSportsTypesParams): Promise<ListSportsTypesResult>;
  create(sportsType: SportsType): Promise<SportsType>;
  update(id: string, changes: { name?: string; icon?: string }): Promise<SportsType | null>;
  setListed(id: string, isListed: boolean): Promise<SportsType | null>;
}
