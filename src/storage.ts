import type { Score, ScoreTable } from './core/scores.js';

const STORAGE_KEY = 'bulls-and-cows:scores';

const isScore = (value: unknown): value is Score =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Score).attempts === 'number' &&
  typeof (value as Score).timeMs === 'number';

const isScoreTable = (value: unknown): value is ScoreTable =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every(
    (list) => Array.isArray(list) && list.every(isScore),
  );

export const loadScores = (): ScoreTable => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '{}',
    );

    return isScoreTable(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const saveScores = (table: ScoreTable): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(table));
  } catch {
    // storage can be full or blocked: the game still works without records
  }
};
