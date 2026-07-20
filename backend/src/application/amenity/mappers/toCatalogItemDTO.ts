import type { Amenity } from '@domain/amenity/entities/Amenity';
import type { CatalogItem } from '@turfhood/shared';

export function toCatalogItemDTO(amenity: Amenity): CatalogItem {
  return {
    id: amenity.id as string,
    name: amenity.name,
    ...(amenity.icon ? { icon: amenity.icon } : {}),
    isListed: amenity.isListed,
    createdAt: (amenity.createdAt as Date).toISOString(),
    updatedAt: (amenity.updatedAt as Date).toISOString(),
  };
}
