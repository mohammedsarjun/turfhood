import { expect } from 'chai';
import { ToggleAmenityListedUseCase } from '../../../src/application/amenity/use-cases/ToggleAmenityListedUseCase.js';
import { AmenityNotFoundError } from '../../../src/domain/amenity/errors/AmenityNotFoundError.js';
import { FakeAmenityRepository } from '../../mocks/FakeAmenityRepository.js';
import { buildAmenity } from '../../fixtures/amenities.fixture.js';

describe('ToggleAmenityListedUseCase', () => {
  it('sets the listed flag and returns the updated item', async () => {
    const existing = buildAmenity({ id: 'amenity_1', isListed: false });
    const amenityRepository = new FakeAmenityRepository({ existingById: existing });
    const useCase = new ToggleAmenityListedUseCase(amenityRepository);

    await useCase.execute({ id: 'amenity_1', isListed: false });

    expect(amenityRepository.setListedCalls).to.deep.equal([{ id: 'amenity_1', isListed: false }]);
  });

  it('throws AmenityNotFoundError when the amenity no longer exists', async () => {
    const amenityRepository = new FakeAmenityRepository({ existingById: null });
    const useCase = new ToggleAmenityListedUseCase(amenityRepository);

    try {
      await useCase.execute({ id: 'missing', isListed: false });
      expect.fail('Expected execute() to throw AmenityNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(AmenityNotFoundError);
    }
  });
});
