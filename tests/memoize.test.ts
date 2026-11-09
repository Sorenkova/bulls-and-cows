import { describe, expect, it, vi } from 'vitest';
import { memoize } from '../src/core/memoize.js';

describe('memoize', () => {
  it('returns the same result as the original function', () => {
    const add = memoize((a: number, b: number) => a + b);
    expect(add(2, 3)).toBe(5);
  });

  it('calls the original function once for the same arguments', () => {
    const original = vi.fn((a: number, b: number) => a + b);
    const add = memoize(original);
    add(2, 3);
    add(2, 3);
    add(2, 3);
    expect(original).toHaveBeenCalledTimes(1);
  });

  it('calls the original function again for different arguments', () => {
    const original = vi.fn((a: number, b: number) => a + b);
    const add = memoize(original);
    add(2, 3);
    add(3, 2);
    expect(original).toHaveBeenCalledTimes(2);
  });

  it('caches falsy results such as 0', () => {
    const original = vi.fn((n: number) => n * 0);
    const zero = memoize(original);
    zero(5);
    zero(5);
    expect(original).toHaveBeenCalledTimes(1);
  });
});
