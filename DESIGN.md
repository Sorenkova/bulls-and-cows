# Bulls and Cows: design notes

A short description of how the game is built. The logic is a set of pure functions in `src/core/`; everything that touches the browser lives outside of it.

## Project structure

- `src/core/` has the game rules: no DOM, no `localStorage`, no `Date.now()`. Time and randomness come in as arguments.
- `src/storage.ts` is the only file that reads and writes `localStorage`.
- `src/ui/` draws the interface with `document.createElement` (no `innerHTML`).
- `src/main.ts` holds the only mutable variable (`app`), calls `Date.now()` and connects everything.
- `tests/` has one test file per core module.

## 1. Data structures and algorithms

### Game state (`src/core/game.ts`)

`GameState` is a plain object with `readonly` fields: `settings`, `secret`, `history`, `status`, `startedAt`, `finishedAt`. There are no classes. `readonly` makes TypeScript reject any mutation, so each change creates a new object with the spread operator.

- `secret` is a **string**, not a number, so leading zeros survive (`'0123'`, not `123`).
- `history` is a `readonly HistoryEntry[]`. An array fits because the order of attempts matters and the list is shown in that order. A new attempt is added as `[...state.history, entry]`. Copying costs O(h) per attempt (h = attempts so far), which is fine for a human-sized game.
- `status` is a union type `'playing' | 'won'`, so impossible states cannot be written.

### Digit alphabet and validator (`src/core/digits.ts`)

`DIGITS = '0123456789abcdef'` is the single source of truth. A number system with base `b` uses the first `b` characters. `createDigitValidator(base)` is curried: it takes the base once and returns a predicate `(char) => boolean` that lowercases the character, so `a` and `A` are the same hex digit.

### `generateSecret` (`src/core/secret.ts`)

The algorithm takes a pool of the alphabet characters and picks without replacement. The recursive helper `pickUnique` takes `pool[floor(random() * pool.length)]`, removes it from the pool with `filter` (a new array, the old one is not changed) and recurses with `count - 1`. Digits cannot repeat by construction, so there is no "generate again if a duplicate appears" loop and the number of steps is always exactly `length`. `random` is a parameter (default `Math.random`), so tests pass a deterministic function and get a predictable secret.

### `evaluateGuess` (`src/core/evaluate.ts`)

Both strings are lowercased and split into character arrays.

- `bulls` = how many guess characters equal the secret character at the same index (`filter` with the index, then `.length`).
- `common` = how many guess characters appear anywhere in the secret (`filter` with `includes`).
- `cows = common - bulls`, because every bull is also a common digit.

This is correct only because digits are unique on both sides (guaranteed by `generateSecret` and `isValidGuess`): each common digit is either in the right place (bull) or not (cow). No loops and no counters, only array methods.

### `isValidGuess` (`src/core/validation.ts`)

Three checks combined with `&&`: the length equals `length`, `every` character passes `createDigitValidator(base)`, and `new Set(chars).size === chars.length` (a Set drops repeats, so a smaller size means a repeated digit). The guess is lowercased first, so `aA` counts as a repeat.

### `countPossibleSecrets` (`src/core/count.ts`, `src/core/memoize.ts`)

The number of secrets is the number of permutations without repetition, P(base, length) = base! / (base - length)!. A secret may start with 0, so nothing is subtracted. The recursion is:

- `count(0, base) = 1` (one empty secret)
- `count(length, base) = base * count(length - 1, base - 1)`

If `length > base`, the chain reaches `count(1, 0) = 0` and the result is 0. `memoize(fn)` is a higher-order function: it keeps a `Map` cache keyed by `JSON.stringify(args)` and checks it with `has` (so a cached result of `0` is not recomputed). The recursive call goes through the memoized function, so every step is cached.

### High scores (`src/core/scores.ts`, `src/storage.ts`)

`ScoreTable` is a record: key `${base}-${length}` to a list of `{ attempts, timeMs }`. Each combination of settings has its own table. `addScore` copies the list, sorts it (fewer attempts first, then less time) and keeps the best 10, returning a new table. `storage.ts` saves it as JSON and checks the shape on load, so broken data in `localStorage` gives an empty table instead of a crash.

## 2. Complexity

n = secret length (2 to 6), b = base (2 to 16), h = attempts made so far.

| Function               | Time                                | Why                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret`       | O(n * b)                            | `pickUnique` recurses n times. Each level filters a pool of at most b characters (O(b)) and builds the result with spread (O(n)). Since n <= b, the total is O(n * b).                                                                                                                                                              |
| `evaluateGuess`        | O(n^2)                              | Bulls: one `filter`, O(n). Common digits: for each of n guess characters, `includes` scans up to n secret characters, so O(n^2). With n <= 6 this is tiny. A `Set` would make it O(n).                                                                                                                                              |
| `isValidGuess`         | O(n * b)                            | For every character the validator slices the alphabet and runs `includes` on at most b characters, so O(n * b). The `Set` check adds O(n).                                                                                                                                                                                          |
| `countPossibleSecrets` | first call O(n), repeated call O(1) | The recursion makes n calls with O(1) work each. After that the answer for the same arguments comes from the cache in O(1). Within a single call the subproblems do not overlap, so the cache pays off on repeated calls (the settings panel asks again on every render) and on shared tails, for example `(3, 9)` after `(4, 10)`. |

## 3. Clean Code principles

- **Meaningful names**: `evaluateGuess`, `createDigitValidator`, `submitGuess`; predicates start with `is` (`isValidGuess`, `isDigit`); constants are named (`DIGITS`, `BASES`, `LENGTHS` in `src/core/settings.ts`).
- **Small functions with one job**: one core module per rule. `countPossibleSecrets` only counts, `memoize` only caches, `clampLength` only picks an allowed length.
- **Pure functions, no side effects**: nothing in `src/core/` touches the DOM or the storage. Time and randomness are passed in: `generateSecret(length, base, random)`, `createGame(settings, secret, startedAt)`, `submitGuess(state, guess, now)`. Side effects are pushed to the edge (`src/storage.ts`, `src/main.ts`).
- **Immutability**: `GameState` and `ScoreTable` use `readonly`; `submitGuess` returns a new state with `[...state.history, entry]`, and `addScore` returns a new table.
- **DRY**: the alphabet exists once (`DIGITS`). `createDigitValidator` is reused in `isValidGuess` (`src/core/validation.ts`) and in the input filter (`src/ui/view.ts`, `gamePanel`).
- **Guard clauses instead of deep nesting**: `submitGuess` returns early for a finished game, an invalid guess and a duplicate; `pickUnique` returns early for `count === 0`.
- **No magic numbers**: the best-scores limit is the named parameter `limit = 10` of `addScore`; the allowed lengths come from `LENGTHS`, not from literals in the UI.
- **Separation of concerns**: rules (`src/core/`), rendering (`src/ui/`), persistence (`src/storage.ts`) and wiring (`src/main.ts`) are in separate places, so the rules are tested without a browser.
- **Explicit error handling**: `generateSecret` throws a `RangeError` for an impossible length; `loadScores` and `saveScores` in `src/storage.ts` catch storage errors and keep the game working.
