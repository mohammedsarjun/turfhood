import { expect } from 'chai';
import type { CourtDTO } from '@turfhood/shared';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { Turf } from '@domain/turf/entities/Turf';
import { ManageCourtDetailsUseCase } from '@application/court/use-cases/ManageCourtDetailsUseCase';
import { CourtAccessError } from '@domain/court/errors/CourtAccessError';
import { DuplicateCourtNameError } from '@domain/court/errors/DuplicateCourtNameError';

const court: CourtDTO = {
  id: 'court_1', turfId: 'turf_1', name: 'Center Court', sportTypeIds: ['sport_1'],
  capacity: 10, status: 'active', allowOpenSessions: true, minPlayersForOpenSession: 4,
  slotDurationMinutes: 60, images: [], pricingRules: [],
  createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(),
};

const turf = Turf.fromPersistence({
  id: 'turf_1', ownerId: 'owner_1', name: 'Arena', location: { type: 'Point', coordinates: [80, 13] },
  address: { line1: '1 Main Street', city: 'Chennai', cityCode: '1', state: 'Tamil Nadu', stateCode: 'TN', country: 'India', countryCode: 'IN', pincode: '600001' },
  amenities: [], sportsOffered: [], rating: { avg: 0, count: 0 }, status: 'approved', verificationId: 'application_1', isDeleted: false,
});

function repositories() {
  const courts: ICourtRepository = {
    existsByName: async () => false, create: async () => court, list: async () => ({ items: [], total: 0 }),
    findByIdAndTurf: async () => court, listOverrides: async () => [],
    createOverride: async (input) => ({ id: 'override_1', ...input, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() }),
    updateOverride: async () => null,
    deleteOverride: async () => true,
    update: async () => court,
  };
  const turfs: ITurfRepository = { create: async (input) => input, findOwnedByIdOrVerificationId: async () => turf };
  return { courts, turfs };
}

describe('ManageCourtDetailsUseCase', () => {
  it('returns the owned court with its availability overrides', async () => {
    const { courts, turfs } = repositories();
    const result = await new ManageCourtDetailsUseCase(courts, turfs).get({ portalTurfId: 'application_1', courtId: 'court_1', ownerId: 'owner_1' });
    expect(result.court.id).to.equal('court_1');
    expect(result.availabilityOverrides).to.deep.equal([]);
  });

  it('rejects a court outside the resolved turf', async () => {
    const { courts, turfs } = repositories();
    courts.findByIdAndTurf = async () => null;
    try {
      await new ManageCourtDetailsUseCase(courts, turfs).get({ portalTurfId: 'application_1', courtId: 'other_court', ownerId: 'owner_1' });
      expect.fail('Expected court access to be rejected.');
    } catch (error) { expect(error).to.be.instanceOf(CourtAccessError); }
  });

  it('rejects an update when another court has the same name', async () => {
    const { courts, turfs } = repositories();
    courts.existsByName = async () => true;
    try {
      await new ManageCourtDetailsUseCase(courts, turfs).update({
        portalTurfId: 'application_1', courtId: 'court_1', ownerId: 'owner_1',
        name: 'Duplicate Court', sportTypeIds: ['sport_1'], capacity: 10, status: 'active',
        allowOpenSessions: true, minPlayersForOpenSession: 4, slotDurationMinutes: 60,
        pricingRules: [{ dayType: 'weekday', startTime: '06:00', endTime: '10:00', pricePerSlot: 500 }],
      });
      expect.fail('Expected duplicate name to be rejected.');
    } catch (error) { expect(error).to.be.instanceOf(DuplicateCourtNameError); }
  });
});
