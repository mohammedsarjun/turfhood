import type { Turf } from '../entities/Turf.js';

export interface ITurfRepository {
  create(turf: Turf): Promise<Turf>;
  findOwnedByIdOrVerificationId(id: string, ownerId: string): Promise<Turf | null>;
}
