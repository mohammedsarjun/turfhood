import { Amenity } from '../../src/domain/amenity/entities/Amenity.js';

export function buildAmenity(
  overrides: { id?: string; name?: string; icon?: string; isListed?: boolean } = {},
): Amenity {
  return Amenity.fromPersistence({
    id: overrides.id ?? 'amenity_1',
    name: overrides.name ?? 'Floodlights',
    ...(overrides.icon ? { icon: overrides.icon } : {}),
    isListed: overrides.isListed ?? true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}
