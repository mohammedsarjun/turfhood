import { SportsType } from '../../src/domain/sportsType/entities/SportsType.js';

export function buildSportsType(
  overrides: { id?: string; name?: string; icon?: string; isListed?: boolean } = {},
): SportsType {
  return SportsType.fromPersistence({
    id: overrides.id ?? 'sport_1',
    name: overrides.name ?? 'Football',
    ...(overrides.icon ? { icon: overrides.icon } : {}),
    isListed: overrides.isListed ?? true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}
