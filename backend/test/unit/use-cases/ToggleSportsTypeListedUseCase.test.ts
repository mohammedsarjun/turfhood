import { expect } from 'chai';
import { ToggleSportsTypeListedUseCase } from '../../../src/application/sportsType/use-cases/ToggleSportsTypeListedUseCase.js';
import { SportsTypeNotFoundError } from '../../../src/domain/sportsType/errors/SportsTypeNotFoundError.js';
import { FakeSportsTypeRepository } from '../../mocks/FakeSportsTypeRepository.js';
import { buildSportsType } from '../../fixtures/sportsTypes.fixture.js';

describe('ToggleSportsTypeListedUseCase', () => {
  it('sets the listed flag and returns the updated item', async () => {
    const existing = buildSportsType({ id: 'sport_1', isListed: false });
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: existing });
    const useCase = new ToggleSportsTypeListedUseCase(sportsTypeRepository);

    await useCase.execute({ id: 'sport_1', isListed: false });

    expect(sportsTypeRepository.setListedCalls).to.deep.equal([{ id: 'sport_1', isListed: false }]);
  });

  it('throws SportsTypeNotFoundError when the sport no longer exists', async () => {
    const sportsTypeRepository = new FakeSportsTypeRepository({ existingById: null });
    const useCase = new ToggleSportsTypeListedUseCase(sportsTypeRepository);

    try {
      await useCase.execute({ id: 'missing', isListed: false });
      expect.fail('Expected execute() to throw SportsTypeNotFoundError, but it did not throw.');
    } catch (error) {
      expect(error).to.be.instanceOf(SportsTypeNotFoundError);
    }
  });
});
