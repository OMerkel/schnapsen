# Software Architecture Runtime

## Data Flow

### Game Initialization

```mermaid
flowchart TD
    A[index.html] --> B[index.js bootstrap]
    B --> C[create GameEngine + GameView + PersistenceManager]
    C --> D[GameController.init()]
    D --> E[load settings and resumable state if present]
    E --> F[render board + shell + overlays]
```

### Talon/Atout Visual Runtime Flow

```mermaid
flowchart TD
    A[Engine state: talon.length, talonClosed, atoutCard, atoutSuit] --> B[GameView derives talon visual state]
    B --> C{Which visual state?}
    C -->|open| D[Show talon backface over open Atout card]
    C -->|closed| E[Show talon and Atout; Atout backface above talon]
    C -->|exhausted| F[Hide talon and Atout card stack; keep Atout suit symbol]
```

This visual logic is state-derived; no duplicated UI-only status flag is
required.

### Open Talon Draw Exhaustion Runtime Flow

```mermaid
flowchart TD
    A[Trick resolves while talon is open] --> B[Winner draws first]
    B --> C{Any face-down talon card left for loser?}
    C -->|yes| D[Loser draws next talon card]
    C -->|no, only open Atout remains| E[Loser receives open Atout card]
    D --> F[Continue open talon phase]
    E --> G[Transition to strict exhausted phase for next trick]
```

### Shell and Overlay Runtime Flow

```mermaid
flowchart TD
    A[User opens menu or overlay] --> B[GameController handles shell event]
    B --> C[renderRules and renderOptions emit current text and config]
    C --> D[User action dispatches engine action when relevant]
    D --> E[afterStateChange persists state and rerenders view]
```

### Human Turn Execution

```mermaid
flowchart TD
    A[Player clicks playable hand card] --> B[GameController resolves legal action from engine]
    B --> C[GameEngine.playAction(player, action)]
    C --> D[Rules and scoring modules process trick and transitions]
    D --> E[GameView.render(newState)]
```

### Atout Swap Runtime Flow

```mermaid
flowchart TD
    A[Active leader opens action panel] --> B{Talon open, not exhausted, and trick not started?}
    B -->|No| C[Swap action disabled]
    B -->|Yes| D{Has lowest Atout rank and talon.length > 2?}
    D -->|No| C
    D -->|Yes| E[Controller dispatches swap-atout]
    E --> F[Engine validates via getAtoutSwapCard]
    F --> G[Exchange open Atout and player's lowest Atout]
    G --> H[Set status message and rerender]
```

### Marriage Announcement Runtime Flow

```mermaid
flowchart TD
    A[Active leader opens action panel] --> B{Marriage pair in same suit on hand?}
    B -->|No| C[No announce-marriage action]
    B -->|Yes| D[Dispatch announce-marriage by suit]
    D --> E[Engine sets pendingMarriageIntent]
    E --> F[Next legal lead restricted to suited King or Ober]
    F --> G[Play suited King/Ober]
    G --> H[Apply immediate or deferred marriage points]
```

### Player Seat and Active Hand Presentation Flow

```mermaid
flowchart TD
    A[State update with currentPlayerIndex] --> B[GameView keeps fixed seats: South bottom, North top]
    B --> C{Which seat is active?}
    C -->|South| D[Render South hand face-up and clickable]
    C -->|North| E[Render North hand face-up and clickable]
    D --> F[Render inactive North hand as backfaces]
    E --> G[Render inactive South hand as backfaces]
    F --> H[Action panel dispatches to active player index]
    G --> H
```

### AI Turn Execution

```mermaid
flowchart TD
    A[afterStateChange invokes maybeRunAI] --> B{Current player is AI and phase is playing?}
    B -->|Yes| C[getAIMove(state, playerIndex, aiLevel)]
    C --> D[GameEngine.playAction(aiPlayer, move)]
    D --> E[persist and rerender]
    B -->|No| F[No AI action]
```

### Hand Resolution and Match Progression

```mermaid
flowchart TD
    A[declare-66 or cards exhausted with final trick] --> B[GameEngine resolves hand winner and hand game points]
    B --> C[Append hand history]
    C --> D{Match target reached?}
    D -->|Yes| E[Set phase to match-over]
    D -->|No| F[startNextHand]
```

### Persistence and Resume Flow

```mermaid
flowchart TD
    A[User action or state change] --> B[PersistenceManager.saveState(state)]
    B --> C[App relaunch]
    C --> D[PersistenceManager.loadState()]
    D --> E[GameEngine.resume(savedState)]
```

---

## Component Interactions

### Object Message Exchange (UI to Engine)

```mermaid
sequenceDiagram
    participant U as User
    participant C as GameController
    participant E as GameEngine
    participant P as PersistenceManager
    participant V as GameView

    U->>C: click playable card
    C->>E: getLegalActions(player)
    E-->>C: actions[]
    C->>E: playAction(player, action)
    E-->>C: updated state
    C->>P: saveState(state)
    C->>V: render(state)
```

### Atout Swap Message Exchange

```mermaid
sequenceDiagram
    participant U as User
    participant C as GameController
    participant E as GameEngine
    participant R as Rules
    participant V as GameView

    U->>C: click Atout tauschen
    C->>E: playAction(player, {type: swap-atout})
    E->>R: getAtoutSwapCard(state, player)
    R-->>E: lowest Atout card or null
    alt swap legal
        E->>E: exchange hand card with open Atout card
        E-->>C: success + updated state
        C->>V: render(updated state)
    else swap illegal
        E-->>C: illegal action result
        C->>V: render(state with status message)
    end
```

### Active Player Dispatch Exchange

```mermaid
sequenceDiagram
    participant U as User
    participant V as GameView
    participant C as GameController
    participant E as GameEngine

    U->>V: click card or action button
    V-->>C: data-card-id/data-player-index or data-action
    C->>E: playAction(currentPlayerIndex, action)
    E-->>C: updated state or illegal result
    C->>V: render(updated state)
```

### AI Message Exchange

```mermaid
sequenceDiagram
    participant C as GameController
    participant A as AI Manager
    participant E as GameEngine
    participant V as GameView

    C->>A: getAIMove(state, player, level)
    A-->>C: legal move
    C->>E: playAction(aiPlayer, move)
    E-->>C: updated state
    C->>V: render(updated state)
```

### Talon State Rendering Exchange

```mermaid
sequenceDiagram
    participant E as GameEngine State
    participant V as GameView

    E-->>V: talon.length, talonClosed, atoutCard
    V->>V: derive visual state (open/closed/exhausted)
    alt open
        V->>V: render talon over open Atout
    else closed
        V->>V: render Atout backface above talon
    else exhausted
        V->>V: hide talon and Atout card stack
        V->>V: keep Atout suit symbol visible
    end
```

---

## Runtime Rules and Transition Semantics

- Open talon allows unconstrained follower play.
- Last open talon draw distributes in order: winner draws final face-down talon card, loser draws open Atout card.
- Open talon additionally allows Atout swap for the active leader only when the
    lowest Atout rank is held (24-card: 9, 20-card: Unter), no trick card has
    been played yet, and more than two talon cards remain.
- After talon exhaustion, strict play starts from the immediately following trick while Atout suit remains active to hand end.
- Marriage requires explicit announce-marriage action; without announcement,
    leading King/Ober yields no marriage points.
- After marriage announcement, legal lead is constrained to King/Ober of the
    announced suit for that trick.
- At most one marriage announcement is legal per lead/trick; if multiple
    marriageable suits are held, additional marriage announcements require later
    leads after trick resolution.
- While marriage intent is pending and no lead card is played yet, close-talon
    remains legal for the active leader if talon-close preconditions are met.
- Closed or exhausted talon activates strict legality.
- Closed talon explicitly disallows Atout swap.
- Marriage points apply immediately only if announcer already won at least one trick.
- Otherwise marriage points are deferred and converted when announcer wins first trick.
- Declare-66 is legal only for active leader before a trick card is played.
- Wrong declare-66 resolves immediately as hand loss for declarer with fixed
    2/3 penalty (3 only if declarer won no trick).
- If nobody claims 66 before cards are exhausted, the final trick winner takes
    the hand for exactly 1 game point.
- Closed-talon failure uses the same fixed 2/3 penalty principle when closer
    does not correctly declare 66 before remaining cards run out.
- Atout/talon UI state is a projection of engine state, not an independent
  finite state in controller code.
- Seat layout remains fixed South/North; active/inactive visibility changes are
    projection-only and do not mutate seat order.

### Edge-Case Ordered Pre-Lead Workflow

The pre-lead action window is intentionally reorderable when legality permits.
Two important ordered workflows are supported as edge-case sample paths, but
only when every individual step is legal at execution time:

- `swap-atout -> close-talon -> announce-marriage -> declare-66`
- `swap-atout -> announce-marriage -> close-talon -> (declare-66 or lead announced King/Ober)`

In the second workflow, closing talon after marriage announcement must not clear
pending marriage intent, and the post-close legal set is still constrained by
the announced marriage unless declare-66 legally ends the hand first.

---

## Runtime Failure Handling

- Illegal action attempts are rejected by engine and reflected via status
  message.
- Persistence load failure falls back to fresh match start.
- AI move lookup returns null if state/player preconditions are not satisfied.
