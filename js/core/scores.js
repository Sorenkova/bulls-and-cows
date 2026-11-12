export const scoreKey = ({ length, base }) => `${base}-${length}`;
const compareScores = (a, b) => a.attempts - b.attempts || a.timeMs - b.timeMs;
export const getScores = (table, key) => table[key] ?? [];
export const addScore = (table, key, score, limit = 10) => ({
    ...table,
    [key]: [...getScores(table, key), score].sort(compareScores).slice(0, limit),
});
