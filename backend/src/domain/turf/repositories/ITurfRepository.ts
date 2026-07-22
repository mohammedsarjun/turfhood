import type { Turf } from '../entities/Turf.js';

export interface ITurfRepository {
  create(turf: Turf): Promise<Turf>;
}
