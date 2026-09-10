import { expect } from 'chai';
import { parsePagination } from '../../src/presentation/shared/utils/pagination.js';

describe('pagination query validation', () => {
  it('accepts pages and caps the requested page size', () => {
    expect(parsePagination({ page: '3', limit: '1000' }, 10, 20)).to.deep.equal({
      page: 3,
      limit: 20,
    });
  });
  it('normalizes malformed, fractional and non-finite values', () => {
    for (const page of ['-1', '0', '1.5', 'Infinity', 'NaN', '1e100', ['2'], {}]) {
      expect(parsePagination({ page, limit: page }, 10)).to.deep.equal({ page: 1, limit: 10 });
    }
  });
});
