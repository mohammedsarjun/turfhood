import { expect } from 'chai';
import { UpdateAmenityUseCase } from '../../../src/application/amenity/use-cases/UpdateAmenityUseCase.js';
import { AmenityNotFoundError } from '../../../src/domain/amenity/errors/AmenityNotFoundError.js';
import { FakeAmenityRepository } from '../../mocks/FakeAmenityRepository.js';
import { buildAmenity } from '../../fixtures/amenities.fixture.js';

describe('UpdateAmenityUseCase', () => {
  it('only forwards the provided fields to the repository', async () => {
    const existing = buildAmenity({ id: 'amenity_1' });
    const amenityRepository = new FakeAmenityRepository({ existingById: existing });
    const useCase = new UpdateAmenityUseCase(amenityRepository);

    await useCase.execute({ id: 'amenity_1', name: '  Parking  ' });

    expect(amenityRepository.updateCalls).to.deep.equal([
      { id: 'amenity_1', changes: { name: 'Parking' } },
    ]);
  });

  it('throws AmenityNotFoundError when the repository finds nothing to update', async () => {
    const amenityRepository = new FakeAmenityRepository({ existingById: null });
    const useCase = new UpdateAmenityUseCase(amenityRepository);

    try {
      await useCase.execute({ id: 'missing', name: 'Parking' });
      expect.fail('Expected execute() to throw AmenityNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(AmenityNotFoundError);
    }
  });
});
