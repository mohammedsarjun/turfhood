import { expect } from 'chai';
import { ListAmenitiesUseCase } from '../../../src/application/amenity/use-cases/ListAmenitiesUseCase.js';
import { FakeAmenityRepository } from '../../mocks/FakeAmenityRepository.js';
import { buildAmenity } from '../../fixtures/amenities.fixture.js';

describe('ListAmenitiesUseCase', () => {
  it('maps repository results to a paginated CatalogItem response', async () => {
    const items = [buildAmenity({ id: 'amenity_1' }), buildAmenity({ id: 'amenity_2' })];
    const amenityRepository = new FakeAmenityRepository({ listResult: { items, total: 5 } });
    const useCase = new ListAmenitiesUseCase(amenityRepository);

    const result = await useCase.execute({ page: 2, limit: 2 });

    expect(result.items.map((item) => item.id)).to.deep.equal(['amenity_1', 'amenity_2']);
    expect(result.pagination).to.deep.equal({ page: 2, limit: 2, total: 5, totalPages: 3 });
  });
});
