const STORAGE_KEY = 'bulls-and-cows:scores';
const isScore = (value) => typeof value === 'object' &&
    value !== null &&
    typeof value.attempts === 'number' &&
    typeof value.timeMs === 'number';
const isScoreTable = (value) => typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((list) => Array.isArray(list) && list.every(isScore));
export const loadScores = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        return isScoreTable(parsed) ? parsed : {};
    }
    catch {
        return {};
    }
};
export const saveScores = (table) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(table));
    }
    catch {
        // storage can be full or blocked: the game still works without records
    }
};
