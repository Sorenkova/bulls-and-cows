import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from '../src/core/count.js';

describe('countPossibleSecrets', () => {
  it('counts permutations P(base, length) for decimal', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(2, 10)).toBe(90);
  });

  it('counts secrets that start with zero too', () => {
    expect(countPossibleSecrets(1, 10)).toBe(10);
  });

  it('counts binary secrets', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('counts octal and hex secrets', () => {
    expect(countPossibleSecrets(3, 8)).toBe(336);
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('returns 1 for length 0 (the empty secret)', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns 0 when the length is bigger than the base', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });

  it('follows the recursive rule base * count(length - 1, base - 1)', () => {
    expect(countPossibleSecrets(5, 12)).toBe(12 * countPossibleSecrets(4, 11));
  });

  it('gives the same answer when called repeatedly', () => {
    expect(countPossibleSecrets(4, 10)).toBe(countPossibleSecrets(4, 10));
  });
});
