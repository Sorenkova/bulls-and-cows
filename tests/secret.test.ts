import { describe, expect, it } from 'vitest';
import { generateSecret } from '../src/core/secret.js';

const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('generateSecret', () => {
  it('always picks the first free digit when random returns 0', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('always picks the last free digit when random is close to 1', () => {
    expect(generateSecret(4, 10, () => 0.999)).toBe('9876');
  });

  it('is predictable for a fixed sequence of random values', () => {
    // pool 0123456789: 0.5 -> index 5 -> '5'; pool 012346789: 0.1 -> index 0 -> '0'
    expect(generateSecret(2, 10, sequence([0.5, 0.1]))).toBe('50');
  });

  it('gives the same result for the same random source', () => {
    const first = generateSecret(5, 16, sequence([0.3, 0.7, 0.1, 0.9, 0.5]));
    const second = generateSecret(5, 16, sequence([0.3, 0.7, 0.1, 0.9, 0.5]));
    expect(first).toBe(second);
  });

  it('returns a string with the requested length', () => {
    expect(generateSecret(6, 16, Math.random)).toHaveLength(6);
  });

  it('never repeats a digit', () => {
    const secret = generateSecret(6, 16, () => 0.5);
    expect(new Set(secret).size).toBe(6);
  });

  it('uses only digits that exist in the base', () => {
    const secret = generateSecret(8, 8, () => 0.3);
    expect([...secret].every((char) => '01234567'.includes(char))).toBe(true);
  });

  it('can start with zero and keeps the leading zero', () => {
    expect(generateSecret(3, 8, () => 0).startsWith('0')).toBe(true);
  });

  it('uses lower case letters for hex', () => {
    expect(generateSecret(6, 16, () => 0.999)).toBe('fedcba');
  });

  it('works with Math.random by default', () => {
    expect(generateSecret(4, 10)).toMatch(/^[0-9]{4}$/);
  });

  it('throws when the length is bigger than the number of digits', () => {
    expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
  });
});
