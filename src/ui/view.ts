import { createDigitValidator } from '../core/digits.js';
import { countPossibleSecrets } from '../core/count.js';
import type { GameState, Settings } from '../core/game.js';
import { BASES, LENGTHS, availableLengths } from '../core/settings.js';
import type { Score } from '../core/scores.js';
import { h } from './dom.js';
import { formatTime, plural } from './format.js';

export type ViewModel = {
  settings: Settings;
  game: GameState | null;
  scores: readonly Score[];
  message: string;
};

export type Actions = {
  changeSettings: (settings: Settings) => void;
  start: () => void;
  guess: (value: string) => void;
  newGame: () => void;
};

const settingsPanel = (
  { settings, game }: ViewModel,
  actions: Actions,
): HTMLElement => {
  const locked = game !== null;
  const allowed = availableLengths(settings.base);

  const lengthSelect = h(
    'select',
    {
      id: 'length',
      disabled: locked,
      onchange: () =>
        actions.changeSettings({
          ...settings,
          length: Number(lengthSelect.value),
        }),
    },
    ...LENGTHS.map((length) =>
      h(
        'option',
        {
          value: String(length),
          selected: length === settings.length,
          disabled: !allowed.includes(length),
        },
        String(length),
      ),
    ),
  );

  const baseSelect = h(
    'select',
    {
      id: 'base',
      disabled: locked,
      onchange: () =>
        actions.changeSettings({
          ...settings,
          base: Number(baseSelect.value),
        }),
    },
    ...Object.entries(BASES).map(([name, base]) =>
      h(
        'option',
        { value: String(base), selected: base === settings.base },
        name,
      ),
    ),
  );

  return h(
    'section',
    { className: 'panel' },
    h('h2', {}, 'Settings'),
    h(
      'div',
      { className: 'row' },
      h('label', { htmlFor: 'length' }, 'Length'),
      lengthSelect,
      h('label', { htmlFor: 'base' }, 'Number system'),
      baseSelect,
    ),
    h(
      'p',
      { className: 'hint', id: 'possible' },
      `Possible secrets: ${countPossibleSecrets(settings.length, settings.base)}`,
    ),
    h(
      'div',
      { className: 'row' },
      h(
        'button',
        {
          type: 'button',
          id: 'start',
          disabled: locked,
          onclick: actions.start,
        },
        'Start',
      ),
      h(
        'button',
        {
          type: 'button',
          id: 'new-game',
          hidden: !locked,
          onclick: actions.newGame,
        },
        'New game',
      ),
    ),
  );
};

const historyList = (game: GameState): HTMLElement =>
  h(
    'ol',
    { className: 'history', id: 'history' },
    ...game.history.map((entry) =>
      h(
        'li',
        {},
        h('code', {}, entry.guess),
        ` — ${plural(entry.bulls, 'bull', 'bulls')}, ${plural(entry.cows, 'cow', 'cows')}`,
      ),
    ),
  );

const gamePanel = (
  { game, message }: ViewModel,
  actions: Actions,
): HTMLElement | null => {
  if (game === null) {
    return null;
  }
  const { length, base } = game.settings;
  const isDigit = createDigitValidator(base);
  const finished = game.status === 'won';

  const input = h('input', {
    id: 'guess',
    type: 'text',
    maxLength: length,
    autocomplete: 'off',
    disabled: finished,
    placeholder: `${length} digits`,
    oninput: () => {
      input.value = [...input.value].filter(isDigit).join('').slice(0, length);
    },
  });

  const form = h(
    'form',
    {
      className: 'row',
      onsubmit: (event) => {
        event.preventDefault();
        actions.guess(input.value);
      },
    },
    h('label', { htmlFor: 'guess' }, 'Your guess'),
    input,
    h('button', { type: 'submit', id: 'try', disabled: finished }, 'Try'),
  );

  const result = finished
    ? h(
        'p',
        { className: 'win', id: 'win' },
        `You won! Secret ${game.secret}, ${plural(game.history.length, 'attempt', 'attempts')}, ${formatTime((game.finishedAt ?? game.startedAt) - game.startedAt)}.`,
      )
    : null;

  return h(
    'section',
    { className: 'panel' },
    h('h2', {}, 'Game'),
    form,
    h('p', { className: 'message', id: 'message', role: 'status' }, message),
    ...(result ? [result] : []),
    historyList(game),
  );
};

const scoresPanel = ({ settings, scores }: ViewModel): HTMLElement => {
  const name =
    Object.entries(BASES).find(([, base]) => base === settings.base)?.[0] ?? '';

  return h(
    'section',
    { className: 'panel' },
    h('h2', {}, `High scores: ${name}, length ${settings.length}`),
    scores.length === 0
      ? h('p', { className: 'hint', id: 'no-scores' }, 'No results yet.')
      : h(
          'table',
          { id: 'scores' },
          h(
            'thead',
            {},
            h(
              'tr',
              {},
              h('th', {}, '#'),
              h('th', {}, 'Attempts'),
              h('th', {}, 'Time'),
            ),
          ),
          h(
            'tbody',
            {},
            ...scores.map((score, index) =>
              h(
                'tr',
                {},
                h('td', {}, String(index + 1)),
                h('td', {}, String(score.attempts)),
                h('td', {}, formatTime(score.timeMs)),
              ),
            ),
          ),
        ),
  );
};

export const view = (model: ViewModel, actions: Actions): HTMLElement[] => {
  const game = gamePanel(model, actions);

  return [
    h('h1', {}, 'Bulls and Cows'),
    settingsPanel(model, actions),
    ...(game ? [game] : []),
    scoresPanel(model),
  ];
};
