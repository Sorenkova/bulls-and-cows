import { describe, expect, it } from 'vitest';
import {
  BASES,
  LENGTHS,
  availableLengths,
  clampLength,
} from '../src/core/settings.js';

describe('settings', () => {
  it('knows the four number systems', () => {
    expect(BASES).toEqual({ bin: 2, oct: 8, dec: 10, hex: 16 });
  });

  it('offers lengths 2-6', () => {
    expect(LENGTHS).toEqual([2, 3, 4, 5, 6]);
  });

  it('allows only length 2 for binary', () => {
    expect(availableLengths(2)).toEqual([2]);
  });

  it('allows every length for octal, decimal and hex', () => {
    expect(availableLengths(8)).toEqual([2, 3, 4, 5, 6]);
    expect(availableLengths(10)).toEqual([2, 3, 4, 5, 6]);
    expect(availableLengths(16)).toEqual([2, 3, 4, 5, 6]);
  });

  it('keeps a length that is still available', () => {
    expect(clampLength(4, 10)).toBe(4);
  });

  it('moves an unavailable length to the biggest available one', () => {
    expect(clampLength(5, 2)).toBe(2);
  });
});
