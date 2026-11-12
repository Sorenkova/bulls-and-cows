import { evaluateGuess } from './evaluate.js';
import { isValidGuess } from './validation.js';
export const createGame = (settings, secret, startedAt) => ({
    settings,
    secret,
    history: [],
    status: 'playing',
    startedAt,
    finishedAt: null,
});
export const submitGuess = (state, rawGuess, now) => {
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
    const entry = { guess, ...evaluateGuess(state.secret, guess) };
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
