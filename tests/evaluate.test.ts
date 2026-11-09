import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../src/core/evaluate.js';

describe('evaluateGuess', () => {
  it('returns 4 bulls and 0 cows for an exact match', () => {
    expect(evaluateGuess('0123', '0123')).toEqual({ bulls: 4, cows: 0 });
  });

  it('returns 0 bulls and 0 cows when nothing matches', () => {
    expect(evaluateGuess('0123', '4567')).toEqual({ bulls: 0, cows: 0 });
  });

  it('counts digits that are in the secret but at the wrong place as cows', () => {
    expect(evaluateGuess('0123', '3210')).toEqual({ bulls: 0, cows: 4 });
  });

  it('counts bulls and cows together', () => {
    expect(evaluateGuess('0123', '0132')).toEqual({ bulls: 2, cows: 2 });
    expect(evaluateGuess('0123', '0456')).toEqual({ bulls: 1, cows: 0 });
    expect(evaluateGuess('0123', '1456')).toEqual({ bulls: 0, cows: 1 });
  });

  it('keeps leading zeros because values are strings', () => {
    expect(evaluateGuess('0123', '0987')).toEqual({ bulls: 1, cows: 0 });
  });

  it('ignores letter case for hex digits', () => {
    expect(evaluateGuess('a1b2', 'A1B2')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess('a1b2', 'B2A1')).toEqual({ bulls: 0, cows: 4 });
  });

  it('works for the shortest game (length 2)', () => {
    expect(evaluateGuess('01', '10')).toEqual({ bulls: 0, cows: 2 });
  });

  it('does not change its arguments and gives the same result every time', () => {
    const secret = '0123';
    const guess = '0132';
    const first = evaluateGuess(secret, guess);
    const second = evaluateGuess(secret, guess);
    expect(second).toEqual(first);
    expect([secret, guess]).toEqual(['0123', '0132']);
  });
});
