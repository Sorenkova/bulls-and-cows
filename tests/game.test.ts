import { describe, expect, it } from 'vitest';
import { createGame, submitGuess } from '../src/core/game.js';

const settings = { length: 4, base: 10 };
const newGame = () => createGame(settings, '0123', 1000);

describe('createGame', () => {
  it('starts with an empty history and the playing status', () => {
    const game = newGame();
    expect(game.history).toEqual([]);
    expect(game.status).toBe('playing');
    expect(game.secret).toBe('0123');
    expect(game.startedAt).toBe(1000);
    expect(game.finishedAt).toBeNull();
  });
});

describe('submitGuess', () => {
  it('adds a new entry with bulls and cows', () => {
    const { state, error } = submitGuess(newGame(), '0132', 2000);
    expect(error).toBeNull();
    expect(state.history).toEqual([{ guess: '0132', bulls: 2, cows: 2 }]);
  });

  it('creates a new history array and does not mutate the old state', () => {
    const before = newGame();
    const { state } = submitGuess(before, '0132', 2000);
    expect(state).not.toBe(before);
    expect(state.history).not.toBe(before.history);
    expect(before.history).toEqual([]);
  });

  it('keeps old entries and appends new ones at the end', () => {
    const first = submitGuess(newGame(), '0132', 2000).state;
    const second = submitGuess(first, '4567', 3000).state;
    expect(second.history.map((entry) => entry.guess)).toEqual([
      '0132',
      '4567',
    ]);
    expect(first.history).toHaveLength(1);
  });

  it('wins when bulls equal the length and saves the finish time', () => {
    const { state } = submitGuess(newGame(), '0123', 5000);
    expect(state.status).toBe('won');
    expect(state.finishedAt).toBe(5000);
  });

  it('stays in the playing status after a wrong guess', () => {
    const { state } = submitGuess(newGame(), '0132', 2000);
    expect(state.status).toBe('playing');
    expect(state.finishedAt).toBeNull();
  });

  it('rejects an invalid guess and returns the same state', () => {
    const before = newGame();
    const result = submitGuess(before, '11', 2000);
    expect(result.error).toBe('invalid');
    expect(result.state).toBe(before);
  });

  it('does not add a repeated guess to the history', () => {
    const first = submitGuess(newGame(), '0132', 2000).state;
    const result = submitGuess(first, '0132', 3000);
    expect(result.error).toBe('duplicate');
    expect(result.state.history).toHaveLength(1);
  });

  it('ignores letter case when it looks for a repeated guess', () => {
    const hex = createGame({ length: 2, base: 16 }, 'ab', 0);
    const first = submitGuess(hex, 'AC', 1).state;
    expect(submitGuess(first, 'aC', 2).error).toBe('duplicate');
  });

  it('stores guesses in lower case', () => {
    const hex = createGame({ length: 2, base: 16 }, 'ab', 0);
    expect(submitGuess(hex, 'AC', 1).state.history[0].guess).toBe('ac');
  });

  it('does not accept guesses after the game is won', () => {
    const won = submitGuess(newGame(), '0123', 2000).state;
    const result = submitGuess(won, '4567', 3000);
    expect(result.error).toBe('finished');
    expect(result.state).toBe(won);
  });
});
