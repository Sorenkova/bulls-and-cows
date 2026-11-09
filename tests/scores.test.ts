import { describe, expect, it } from 'vitest';
import { addScore, getScores, scoreKey } from '../src/core/scores.js';

describe('scoreKey', () => {
  it('makes one key for each combination of base and length', () => {
    expect(scoreKey({ length: 4, base: 10 })).toBe('10-4');
    expect(scoreKey({ length: 2, base: 16 })).toBe('16-2');
  });
});

describe('addScore', () => {
  it('adds a score to an empty table', () => {
    const table = addScore({}, '10-4', { attempts: 5, timeMs: 9000 });
    expect(table['10-4']).toEqual([{ attempts: 5, timeMs: 9000 }]);
  });

  it('sorts by attempts first', () => {
    const first = addScore({}, 'k', { attempts: 7, timeMs: 1000 });
    const second = addScore(first, 'k', { attempts: 3, timeMs: 9000 });
    expect(second.k.map((score) => score.attempts)).toEqual([3, 7]);
  });

  it('sorts by time when attempts are equal', () => {
    const first = addScore({}, 'k', { attempts: 4, timeMs: 9000 });
    const second = addScore(first, 'k', { attempts: 4, timeMs: 2000 });
    expect(second.k.map((score) => score.timeMs)).toEqual([2000, 9000]);
  });

  it('keeps only the best N scores', () => {
    const table = [9, 8, 7, 6, 5].reduce(
      (acc, attempts) => addScore(acc, 'k', { attempts, timeMs: 1 }, 3),
      {},
    ) as Record<string, { attempts: number }[]>;
    expect(table.k.map((score) => score.attempts)).toEqual([5, 6, 7]);
  });

  it('keeps tables of other settings apart', () => {
    const table = addScore({}, '10-4', { attempts: 5, timeMs: 1 });
    const next = addScore(table, '16-2', { attempts: 2, timeMs: 1 });
    expect(next['10-4']).toHaveLength(1);
    expect(next['16-2']).toHaveLength(1);
  });

  it('does not change the old table', () => {
    const before = addScore({}, 'k', { attempts: 5, timeMs: 1 });
    addScore(before, 'k', { attempts: 1, timeMs: 1 });
    expect(before.k).toHaveLength(1);
  });
});

describe('getScores', () => {
  it('returns an empty list when nothing is saved for the key', () => {
    expect(getScores({}, '10-4')).toEqual([]);
  });

  it('returns the saved list', () => {
    const table = addScore({}, 'k', { attempts: 5, timeMs: 1 });
    expect(getScores(table, 'k')).toEqual([{ attempts: 5, timeMs: 1 }]);
  });
});
