import { createDigitValidator } from './digits.js';
export const isValidGuess = (guess, length, base) => {
    const chars = [...guess.toLowerCase()];
    const isDigit = createDigitValidator(base);
    return (chars.length === length &&
        chars.every(isDigit) &&
        new Set(chars).size === chars.length);
};
