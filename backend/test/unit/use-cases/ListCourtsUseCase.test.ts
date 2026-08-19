import { expect } from 'chai';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { Turf } from '@domain/turf/entities/Turf';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { CourtAccessError } from '@domain/court/errors/CourtAccessError';
import { ListCourtsUseCase } from '@application/court/use-cases/ListCourtsUseCase';

describe('ListCourtsUseCase', () => {
  const turf = Turf.fromPersistence({
    id: 'turf_1',
    ownerId: 'owner_1',
    name: 'Arena',
    location: { type: 'Point', coordinates: [80, 13] },
    address: {
      line1: '1 Main Street',
      city: 'Chennai',
      cityCode: '1',
      state: 'Tamil Nadu',
      stateCode: 'TN',
      country: 'India',
      countryCode: 'IN',
      pincode: '600001',
    },
    amenities: [],
    sportsOffered: [],
    rating: { avg: 0, count: 0 },
    status: 'approved',
    verificationId: 'application_1',
    isDeleted: false,
  });

  it('resolves the owned portal turf and returns backend pagination', async () => {
    let receivedSearch: string | undefined;
    const courts: ICourtRepository = {
      existsByName: async () => false,
      create: async () => {
        throw new Error('Not used');
      },
      list: async (input) => {
        receivedSearch = input.search;
        return { items: [], total: 21 };
      },
      findByIdAndTurf: async () => null,
      listOverrides: async () => [],
      createOverride: async () => { throw new Error('Not used'); },
      updateOverride: async () => null,
      deleteOverride: async () => false,
      update: async () => null,
    };
    const turfs: ITurfRepository = {
      create: async (input) => input,
      findOwnedByIdOrVerificationId: async () => turf,
    };
    const useCase = new ListCourtsUseCase(courts, turfs);

    const result = await useCase.execute({
      portalTurfId: 'application_1',
      ownerId: 'owner_1',
      page: 2,
      limit: 10,
      search: 'Court A',
    });

    expect(receivedSearch).to.equal('Court A');
    expect(result.pagination).to.deep.equal({ page: 2, limit: 10, total: 21, totalPages: 3 });
  });

  it('rejects access when the turf does not belong to the user', async () => {
    const courts: ICourtRepository = {
      existsByName: async () => false,
      create: async () => {
        throw new Error('Not used');
      },
      list: async () => ({ items: [], total: 0 }),
      findByIdAndTurf: async () => null,
      listOverrides: async () => [],
      createOverride: async () => { throw new Error('Not used'); },
      updateOverride: async () => null,
      deleteOverride: async () => false,
      update: async () => null,
    };
    const turfs: ITurfRepository = {
      create: async (input) => input,
      findOwnedByIdOrVerificationId: async () => null,
    };
    const useCase = new ListCourtsUseCase(courts, turfs);

    try {
      await useCase.execute({
        portalTurfId: 'application_1',
        ownerId: 'other_owner',
        page: 1,
        limit: 10,
      });
      expect.fail('Expected access to be rejected.');
    } catch (error) {
      expect(error).to.be.instanceOf(CourtAccessError);
    }
  });
});
