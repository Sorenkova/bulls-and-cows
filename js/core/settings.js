export const BASES = { bin: 2, oct: 8, dec: 10, hex: 16 };
export const LENGTHS = [2, 3, 4, 5, 6];
export const availableLengths = (base) => LENGTHS.filter((length) => length <= base);
export const clampLength = (length, base) => {
    const lengths = availableLengths(base);
    return lengths.includes(length) ? length : lengths[lengths.length - 1];
};
