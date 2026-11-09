import { describe, expect, it } from 'vitest';
import { isValidGuess } from '../src/core/validation.js';

describe('isValidGuess', () => {
  it('accepts a guess with the right length and unique valid digits', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('rejects a guess that is too short or too long', () => {
    expect(isValidGuess('012', 4, 10)).toBe(false);
    expect(isValidGuess('01234', 4, 10)).toBe(false);
  });

  it('rejects an empty guess', () => {
    expect(isValidGuess('', 2, 10)).toBe(false);
  });

  it('rejects digits that do not exist in the base', () => {
    expect(isValidGuess('012', 3, 2)).toBe(false);
    expect(isValidGuess('78', 2, 8)).toBe(false);
    expect(isValidGuess('1a', 2, 10)).toBe(false);
  });

  it('rejects repeated digits', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
  });

  it('treats a and A as the same digit when looking for repeats', () => {
    expect(isValidGuess('aA', 2, 16)).toBe(false);
  });

  it('accepts upper case hex digits', () => {
    expect(isValidGuess('A1F', 3, 16)).toBe(true);
  });

  it('accepts the only valid binary guess of length 2', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('00', 2, 2)).toBe(false);
  });
});
