import { DIGITS } from './digits.js';
const pickUnique = (pool, count, random) => {
    if (count === 0) {
        return [];
    }
    const index = Math.floor(random() * pool.length);
    const rest = pool.filter((_, i) => i !== index);
    return [pool[index], ...pickUnique(rest, count - 1, random)];
};
export const generateSecret = (length, base, random = Math.random) => {
    if (length > base) {
        throw new RangeError('Length cannot be bigger than the base');
    }
    return pickUnique([...DIGITS.slice(0, base)], length, random).join('');
};
