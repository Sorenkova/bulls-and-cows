import { memoize } from './memoize.js';

export const countPossibleSecrets: (length: number, base: number) => number =
  memoize((length: number, base: number): number =>
    length === 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1),
  );
