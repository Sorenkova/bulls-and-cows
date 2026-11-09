import { evaluateGuess, type GuessResult } from './evaluate.js';
import { isValidGuess } from './validation.js';

export type Settings = { length: number; base: number };
export type HistoryEntry = GuessResult & { guess: string };
export type GameStatus = 'playing' | 'won';

export type GameState = {
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly HistoryEntry[];
  readonly status: GameStatus;
  readonly startedAt: number;
  readonly finishedAt: number | null;
};

export type SubmitError = 'invalid' | 'duplicate' | 'finished';
export type SubmitResult = { state: GameState; error: SubmitError | null };

export const createGame = (
  settings: Settings,
  secret: string,
  startedAt: number,
): GameState => ({
  settings,
  secret,
  history: [],
  status: 'playing',
  startedAt,
  finishedAt: null,
});

export const submitGuess = (
  state: GameState,
  rawGuess: string,
  now: number,
): SubmitResult => {
  const guess = rawGuess.toLowerCase();
  const { length, base } = state.settings;

  if (state.status === 'won') {
    return { state, error: 'finished' };
  }
  if (!isValidGuess(guess, length, base)) {
    return { state, error: 'invalid' };
  }
  if (state.history.some((entry) => entry.guess === guess)) {
    return { state, error: 'duplicate' };
  }

  const entry: HistoryEntry = { guess, ...evaluateGuess(state.secret, guess) };
  const won = entry.bulls === length;

  return {
    state: {
      ...state,
      history: [...state.history, entry],
      status: won ? 'won' : 'playing',
      finishedAt: won ? now : null,
    },
    error: null,
  };
};
