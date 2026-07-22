import { TurfOwnerApplication } from '../../src/domain/turfOwnerApplication/entities/TurfOwnerApplication.js';
import type { TurfAddress } from '../../src/domain/turf/entities/Turf.js';

const DEFAULT_ADDRESS: TurfAddress = {
  line1: '12 Anna Salai',
  city: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India',
  pincode: '600002',
};

export function buildTurfOwnerApplication(
  overrides: {
    id?: string;
    applicantUserId?: string;
    name?: string;
    status?: 'pending' | 'approved' | 'rejected';
    sportsOffered?: string[];
    amenities?: string[];
    images?: { url: string; isCover: boolean }[];
  } = {},
): TurfOwnerApplication {
  return TurfOwnerApplication.fromPersistence({
    id: overrides.id ?? 'application_1',
    applicantUserId: overrides.applicantUserId ?? 'user_1',
    name: overrides.name ?? 'Green Turf Arena',
    address: DEFAULT_ADDRESS,
    location: { type: 'Point', coordinates: [80.2707, 13.0827] },
    sportsOffered: overrides.sportsOffered ?? ['sport_1'],
    amenities: overrides.amenities ?? [],
    documents: [{ type: 'lease_agreement', url: 'http://cdn.test/lease.pdf' }],
    images: overrides.images ?? [{ url: 'http://cdn.test/cover.jpg', isCover: true }],
    status: overrides.status ?? 'pending',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}
