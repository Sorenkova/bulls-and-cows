import { memoize } from './memoize.js';
export const countPossibleSecrets = memoize((length, base) => length === 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1));
