# Software Architecture Modules

## Module Responsibilities

### Core Game Logic (src/core)

#### card.js - Card Representation (FR-CRD-003, FR-CRD-007)

```javascript
class Card {
  constructor(suit, rank)
  get label()            // "Ass von Eichel"
  get shortLabel()       // "A Eichel"
  toJSON()
  static from(value)
}
```

Responsibility: immutable card value object with display labels and
serialization helpers.

---

#### deck.js - Deck Creation and Shuffle (FR-CRD-001..FR-CRD-006)

```javascript
createDeck(deckVariant)
createSeededRandom(seed)
shuffleDeck(deck, randomFn)
```

Responsibility: deterministic and nondeterministic deck generation/shuffling for
20-card and 24-card variants.

---

#### dealing.js - Deal and Draw Flow (FR-DAL-002..FR-DAL-005, FR-OPN-006)

```javascript
dealInitialHand(deckVariant, randomFn)
drawAfterTrick(talon, winnerHand, loserHand)
```

Responsibility: initial 5-card dealing, Atout reveal, and winner-first draw
behavior while talon remains open.

---

#### rules.js - Legality and Trick Resolution (FR-OPN-001..FR-OPN-007, FR-STR-001..FR-STR-005)

```javascript
compareCards(firstCard, secondCard, ledSuit, atoutSuit, deckVariant)
determineTrickWinner(trickCards, atoutSuit, deckVariant)
requiresStrictPlay(handState)
getLegalCards(handState, playerIndex)
getMarriageChoices(handState, playerIndex)
getAtoutSwapCard(handState, playerIndex)
explainLegalReason(handState, playerIndex)
```

Responsibility: central legal-move engine for open talon and strict-play modes,
including marriage preconditions, Atout swap preconditions (FR-TAL-006,
FR-TAL-007), and explainable legality text.

---

#### scoring.js - Hand and Bummerl Scoring (FR-MRG-004..FR-MRG-008, FR-END-003..FR-END-008)

```javascript
getTrickPoints(cards)
getMarriagePoints(suit, atoutSuit)
computeGamePoints(winner, loser)
```

Responsibility: card points, marriage value, and hand-level game point outcome.

---

#### game-state.js - Match State Model (FR-MAT-001..FR-MAT-003)

```javascript
createPlayerState(index, settingsPlayer)
createMatchState(settings)
```

Responsibility: canonical match state shape including talon state, Atout state,
trick state, seat identity (`player_south`/`player_north`), pending marriage
intent state, hand history, and status message.

---

#### game-engine.js - Orchestration and Transitions

```javascript
class GameEngine {
  startMatch(seed?)
  startNextHand(seed?)
  getState()
  getLegalActions(playerIndex)
  playAction(playerIndex, action)
  setSettings(settings)
  resume(savedState)
}
```

Responsibility: coordinates dealing, action validation, trick settlement,
marriage announce/apply sequence (`announce-marriage` + suited lead), talon
closing, Atout swap action handling (`swap-atout`), lead-only 66 claim
adjudication (success vs immediate failed-claim loss with 2/3 penalty), hand
resolution, and match progression. This orchestration explicitly supports
reorderable pre-lead edge-case workflows where `close-talon` may occur either
before or after `announce-marriage` while preserving pending marriage intent
until a legal lead or declare-66 ends that pre-lead window. These workflows are
conditional sample paths and apply only when each step's legality preconditions
are satisfied at the moment of action.

Marriage sequencing constraint: only one announce-marriage action is accepted
per lead/trick; additional marriage announcements require later leads after
trick resolution and leader retention.

---

### AI (src/ai)

#### ai-manager.js - Legal AI Move Selection (FR-AI-001..FR-AI-005)

```javascript
getAIMove(state, playerIndex, level = "medium")
```

Responsibility: choose a legal action for Easy/Medium/Hard profiles using rule
helpers and state heuristics, including explicit marriage announce and
follow-up suited lead behavior.

---

### UI (src/ui)

#### game-controller.js - UI Event Orchestration

```javascript
class GameController {
  init()
  handleClick(event)
  handleChange(event)
  afterStateChange()
  maybeRunAI()
  render()
  renderRules()
  renderOptions()
}
```

Responsibility: shell actions, button/overlay routing, dispatching engine
actions (including `swap-atout` and `announce-marriage`) for the currently
active player, persistence calls, and UI rerender.

#### game-view.js - Declarative Board Rendering (FR-UIR-002, FR-UIR-005..FR-UIR-007)

```javascript
class GameView {
  render(state)
}
```

Responsibility: render board, hand cards, current trick, Atout/talon visual
states (`open`, `closed`, `exhausted`), fixed South/North seat positions with
active-hand face-up projection, Atout swap and marriage announce button
enablement from state preconditions, and status panels.

---

### Persistence (src/persistence)

#### persistence-manager.js - Local Save/Resume (FR-PRS-001..FR-PRS-004)

```javascript
class PersistenceManager {
  saveSettings(settings)
  loadSettings()
  saveState(state)
  loadState()
  clearState()
}
```

Responsibility: browser-local storage for options and resumable match state.

---

### Configuration (src/config)

- configuration.js: normalize settings and defaults
- constants.js: card/suit/rank constants and asset paths
- messages.js: centralized user-facing status messages

Responsibility: stable configuration and message contracts for engine, UI, and
tests.

---

### PWA Runtime (src)

- index.js: app bootstrap and controller initialization
- index.html: app shell and overlay containers
- sw.js: app-shell and asset caching strategy
- manifest.json: install metadata

Responsibility: entrypoint and offline install/runtime behavior.

---

### Test Suite (src/test)

Key suites include:

- schnapsen-card.test.js
- schnapsen-deck-and-dealing.test.js
- schnapsen-rules.test.js
- schnapsen-scoring.test.js
- schnapsen-engine.test.js
- schnapsen-ai.test.js
- schnapsen-persistence.test.js
- schnapsen-ui-shell.test.js

Responsibility: requirement-mapped unit and integration coverage across engine,
UI shell behavior (including Atout swap visibility/enablement, fixed seat
projection, and active-player control targeting), persistence, and PWA
metadata.
