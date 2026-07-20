import type { SportsType } from '@domain/sportsType/entities/SportsType';
import type { CatalogItem } from '@turfhood/shared';

export function toCatalogItemDTO(sportsType: SportsType): CatalogItem {
  return {
    id: sportsType.id as string,
    name: sportsType.name,
    ...(sportsType.icon ? { icon: sportsType.icon } : {}),
    isListed: sportsType.isListed,
    createdAt: (sportsType.createdAt as Date).toISOString(),
    updatedAt: (sportsType.updatedAt as Date).toISOString(),
  };
}
