import { expect } from 'chai';
import { UpdateSportsTypeUseCase } from '../../../src/application/sportsType/use-cases/UpdateSportsTypeUseCase.js';
import { SportsTypeNotFoundError } from '../../../src/domain/sportsType/errors/SportsTypeNotFoundError.js';
import { FakeSportsTypeRepository } from '../../mocks/FakeSportsTypeRepository.js';
import { buildSportsType } from '../../fixtures/sportsTypes.fixture.js';

describe('UpdateSportsTypeUseCase', () => {
  it('only forwards the provided fields to the repository', async () => {
    const existing = buildSportsType({ id: 'sport_1' });
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: existing });
    const useCase = new UpdateSportsTypeUseCase(sportsTypeRepository);

    await useCase.execute({ id: 'sport_1', name: '  Cricket  ' });

    expect(sportsTypeRepository.updateCalls).to.deep.equal([
      { id: 'sport_1', changes: { name: 'Cricket' } },
    ]);
  });

  it('throws SportsTypeNotFoundError when the repository finds nothing to update', async () => {
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: null });
    const useCase = new UpdateSportsTypeUseCase(sportsTypeRepository);

    try {
      await useCase.execute({ id: 'missing', name: 'Cricket' });
      expect.fail('Expected execute() to throw SportsTypeNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(SportsTypeNotFoundError);
    }
  });
});
