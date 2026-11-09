import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../src/core/digits.js';

describe('createDigitValidator', () => {
  it('returns a function (curried factory)', () => {
    expect(typeof createDigitValidator(10)).toBe('function');
  });

  it('accepts only 0 and 1 for binary', () => {
    const isDigit = createDigitValidator(2);
    expect(isDigit('0')).toBe(true);
    expect(isDigit('1')).toBe(true);
    expect(isDigit('2')).toBe(false);
  });

  it('accepts 0-7 for octal and rejects 8', () => {
    const isDigit = createDigitValidator(8);
    expect(isDigit('7')).toBe(true);
    expect(isDigit('8')).toBe(false);
  });

  it('accepts 0-9 for decimal and rejects letters', () => {
    const isDigit = createDigitValidator(10);
    expect(isDigit('9')).toBe(true);
    expect(isDigit('a')).toBe(false);
  });

  it('accepts 0-9 and a-f for hex', () => {
    const isDigit = createDigitValidator(16);
    expect(isDigit('f')).toBe(true);
    expect(isDigit('g')).toBe(false);
  });

  it('treats upper and lower case hex letters as the same digit', () => {
    const isDigit = createDigitValidator(16);
    expect(isDigit('A')).toBe(true);
    expect(isDigit('F')).toBe(true);
  });

  it('rejects empty strings, several characters and symbols', () => {
    const isDigit = createDigitValidator(16);
    expect(isDigit('')).toBe(false);
    expect(isDigit('12')).toBe(false);
    expect(isDigit('-')).toBe(false);
    expect(isDigit(' ')).toBe(false);
  });
});
