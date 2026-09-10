import { expect } from 'chai';
import { container } from 'tsyringe';
import { ManageBookingsUseCase } from '../../../src/application/booking/use-cases/ManageBookingsUseCase.js';
import { BOOKING_TOKENS } from '../../../src/domain/booking/tokens.js';
import type { IBookingRepository } from '../../../src/domain/booking/repositories/IBookingRepository.js';

describe('My Bookings backend pagination', () => {
  it('filters before requesting a page and uses the filtered count for metadata', async () => {
    const calls: Parameters<IBookingRepository['listByUser']>[] = [];
    const repository = {
      completePast: async () => 0,
      listByUser: async (...args: Parameters<IBookingRepository['listByUser']>) => {
        calls.push(args);
        return { items: [], total: 21 };
      },
    } satisfies Pick<IBookingRepository, 'completePast' | 'listByUser'>;
    const scope = container.createChildContainer();
    scope.registerInstance(BOOKING_TOKENS.Repository, repository);
    const useCase = scope.resolve(ManageBookingsUseCase);
    const result = await useCase.listMine('user_1', 2, 10, 'cancelled');
    expect(calls).to.deep.equal([
      [
        'user_1',
        2,
        10,
        ['cancelled_by_user', 'cancelled_by_owner', 'refunded', 'partially_refunded'],
      ],
    ]);
    expect(result.pagination).to.deep.equal({ page: 2, limit: 10, total: 21, totalPages: 3 });
  });
});
