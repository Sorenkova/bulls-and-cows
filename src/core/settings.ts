export const BASES = { bin: 2, oct: 8, dec: 10, hex: 16 } as const;

export const LENGTHS: readonly number[] = [2, 3, 4, 5, 6];

export const availableLengths = (base: number): number[] =>
  LENGTHS.filter((length) => length <= base);

export const clampLength = (length: number, base: number): number => {
  const lengths = availableLengths(base);

  return lengths.includes(length) ? length : lengths[lengths.length - 1];
};
