import type { Settings } from './game.js';

export type Score = { attempts: number; timeMs: number };
export type ScoreTable = Readonly<Record<string, readonly Score[]>>;

export const scoreKey = ({ length, base }: Settings): string =>
  `${base}-${length}`;

const compareScores = (a: Score, b: Score): number =>
  a.attempts - b.attempts || a.timeMs - b.timeMs;

export const getScores = (table: ScoreTable, key: string): readonly Score[] =>
  table[key] ?? [];

export const addScore = (
  table: ScoreTable,
  key: string,
  score: Score,
  limit = 10,
): ScoreTable => ({
  ...table,
  [key]: [...getScores(table, key), score].sort(compareScores).slice(0, limit),
});
