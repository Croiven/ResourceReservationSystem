import { describe, expect, it } from 'vitest';
import { buildResourceListQuery, truncateResourceDescription } from './resourceListQuery';

describe('resourceListQuery', () => {
  it('builds query from filters', () => {
    expect(buildResourceListQuery('  desk ', 'ROOM', 'true')).toEqual({
      active: 'true',
      type: 'ROOM',
      search: 'desk',
    });
  });

  it('omits empty optional filters', () => {
    expect(buildResourceListQuery('', '', 'all')).toEqual({});
  });

  it('truncates long descriptions', () => {
    const long = 'a'.repeat(100);
    expect(truncateResourceDescription(long)).toHaveLength(81);
    expect(truncateResourceDescription(long).endsWith('…')).toBe(true);
  });

  it('returns em dash for missing description', () => {
    expect(truncateResourceDescription(null)).toBe('—');
  });
});
