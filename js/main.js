import { generateSecret } from './core/secret.js';
import { createGame, submitGuess, } from './core/game.js';
import { clampLength } from './core/settings.js';
import { addScore, getScores, scoreKey, } from './core/scores.js';
import { loadScores, saveScores } from './storage.js';
import { h } from './ui/dom.js';
import { view } from './ui/view.js';
const root = h('main');
document.body.append(root);
let app = {
    settings: { length: 4, base: 10 },
    game: null,
    scores: loadScores(),
    message: '',
};
const messages = {
    invalid: 'Use only valid, different digits and fill every position.',
    duplicate: 'You already tried this guess.',
    finished: 'The game is over. Start a new one.',
};
const render = () => {
    root.replaceChildren(...view({
        settings: app.settings,
        game: app.game,
        scores: getScores(app.scores, scoreKey(app.settings)),
        message: app.message,
    }, actions));
    root.querySelector('#guess')?.focus();
};
const update = (next) => {
    app = { ...app, ...next };
    render();
};
const actions = {
    changeSettings: ({ base, length }) => update({ settings: { base, length: clampLength(length, base) } }),
    start: () => update({
        game: createGame(app.settings, generateSecret(app.settings.length, app.settings.base), Date.now()),
        message: '',
    }),
    guess: (value) => {
        if (app.game === null) {
            return;
        }
        const { state, error } = submitGuess(app.game, value, Date.now());
        if (error !== null) {
            update({ message: messages[error] });
            return;
        }
        const justWon = state.status === 'won';
        const scores = justWon
            ? addScore(app.scores, scoreKey(state.settings), {
                attempts: state.history.length,
                timeMs: (state.finishedAt ?? state.startedAt) - state.startedAt,
            })
            : app.scores;
        if (justWon) {
            saveScores(scores);
        }
        update({ game: state, scores, message: '' });
    },
    newGame: () => update({ game: null, message: '' }),
};
render();
