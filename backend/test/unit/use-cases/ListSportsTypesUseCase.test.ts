import { expect } from 'chai';
import { ListSportsTypesUseCase } from '../../../src/application/sportsType/use-cases/ListSportsTypesUseCase.js';
import { FakeSportsTypeRepository } from '../../mocks/FakeSportsTypeRepository.js';
import { buildSportsType } from '../../fixtures/sportsTypes.fixture.js';

describe('ListSportsTypesUseCase', () => {
  it('maps repository results to a paginated CatalogItem response', async () => {
    const items = [buildSportsType({ id: 'sport_1' }), buildSportsType({ id: 'sport_2' })];
    const sportsTypeRepository = new FakeSportsTypeRepository({
      listResult: { items, total: 5 },
    });
    const useCase = new ListSportsTypesUseCase(sportsTypeRepository);

    const result = await useCase.execute({ page: 2, limit: 2 });

    expect(result.items.map((item) => item.id)).to.deep.equal(['sport_1', 'sport_2']);
    expect(result.pagination).to.deep.equal({ page: 2, limit: 2, total: 5, totalPages: 3 });
  });
});
