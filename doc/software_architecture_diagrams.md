# Software Architecture Diagrams

## System Diagrams

This section contains visual representations of the Schnapsen architecture:

- [Core Class Architecture](#core-class-architecture-diagram)
- [Game and Hand State Chart](#game-and-hand-state-chart)
- [Layered Architecture](#layered-architecture-diagram)
- [Deployment Architecture](#deployment-architecture)
- [Human Turn Sequence](#human-turn-sequence-diagram)
- [AI Turn Sequence](#ai-turn-sequence-diagram)
- [Talon Visual State Sequence](#talon-visual-state-sequence)
- [Game Flow Chart](#game-flow-chart)
- [Trick Resolution Flow Chart](#trick-resolution-flow-chart)
- [Atout Swap Flow Chart](#atout-swap-flow-chart)
- [Marriage Announcement Flow Chart](#marriage-announcement-flow-chart)
- [Player Seat Presentation Flow Chart](#player-seat-presentation-flow-chart)
- [Talon Visual State Flow Chart](#talon-visual-state-flow-chart)

---

### Core Class Architecture Diagram

```mermaid
classDiagram
    class Card {
        +suit: string
        +rank: string
        +id: string
        +label: string
        +shortLabel: string
        +toJSON() object
        +from(value) Card
    }

    class GameState {
        +phase: string
        +players: Player[]
        +currentPlayerIndex: number
        +pendingMarriageIntent: object|null
        +currentTrick: object
        +talon: Card[]
        +atoutCard: Card|null
        +atoutSuit: string|null
        +talonClosed: bool
        +statusMessage: string
    }

    class GameEngine {
        +startMatch(seed?)
        +startNextHand(seed?)
        +getLegalActions(playerIndex)
        +playAction(playerIndex, action)
        +getState() GameState
    }

    class Rules {
        +compareCards(...)
        +determineTrickWinner(...)
        +getLegalCards(...)
        +getMarriageChoices(...)
        +getAtoutSwapCard(...)
    }

    class Scoring {
        +getTrickPoints(cards)
        +getMarriagePoints(suit, atoutSuit)
        +computeGamePoints(winner, loser)
    }

    class AIManager {
        +getAIMove(state, playerIndex, level)
    }

    class GameController {
        +init()
        +handleClick(event)
        +afterStateChange()
        +render()
    }

    class GameView {
        +render(state)
    }

    class PersistenceManager {
        +saveState(state)
        +loadState()
        +saveSettings(settings)
        +loadSettings()
    }

    GameEngine --> GameState : manages
    GameEngine --> Rules : uses
    GameEngine --> Scoring : uses
    GameController --> GameEngine : dispatches actions
    GameController --> PersistenceManager : save/load
    GameController --> GameView : render
    GameController --> AIManager : request move
    GameView --> GameState : projection
```

---

### Game and Hand State Chart

```mermaid
stateDiagram-v2
    [*] --> Setup
    Setup --> MatchStart: startMatch()
    MatchStart --> HandDealing: dealInitialHand()
    HandDealing --> PlayingOpen: talon.length > 0 and not talonClosed

    state PlayingOpen {
        [*] --> TrickLead
        TrickLead --> MarriageAnnounced: announce-marriage action legal
        MarriageAnnounced --> TrickLead: suited König/Ober lead committed
        TrickLead --> SwapAtout: swap-atout action legal
        SwapAtout --> TrickLead: open Atout exchanged
        TrickLead --> TrickFollow: leader plays
        TrickFollow --> TrickResolve: follower plays
        TrickResolve --> DrawPhase: winner determined
        DrawPhase --> TrickLead: draw winner then loser (talon.length >= 2)
        DrawPhase --> PlayingStrictExhausted: winner draws final face-down talon, loser draws open Atout
    }

    PlayingOpen --> PlayingStrictClosed: close-talon action
    PlayingOpen --> PlayingStrictExhausted: talon.length == 0

    state PlayingStrictClosed {
        [*] --> StrictTrickLead
        StrictTrickLead --> StrictTrickFollow: leader plays
        StrictTrickFollow --> StrictResolve: follower plays strict legality
        StrictResolve --> StrictTrickLead: no draw
    }

    state PlayingStrictExhausted {
        [*] --> ExhaustedLead
        ExhaustedLead --> ExhaustedFollow: leader plays
        ExhaustedFollow --> ExhaustedResolve: follower plays strict legality
        ExhaustedResolve --> ExhaustedLead: no draw
    }

    PlayingOpen --> HandEnd: declare-66 adjudicated (win or failed claim)
    PlayingStrictClosed --> HandEnd: declare-66 adjudicated or cards exhausted
    PlayingStrictExhausted --> HandEnd: declare-66 adjudicated or cards exhausted

    HandEnd --> MatchOver: gamePoints >= matchTarget
    HandEnd --> HandDealing: startNextHand()
    MatchOver --> [*]
```

---

### Layered Architecture Diagram

```mermaid
graph TB
    subgraph Presentation
      UI[GameView + index.html]
      Ctrl[GameController]
    end

    subgraph Domain
      Engine[GameEngine]
      Rules[Rules]
      Score[Scoring]
      Deal[Dealing/Deck]
    end

    subgraph AI
      AIMgr[AI Manager]
    end

    subgraph Persistence
      Persist[Persistence Manager]
      Config[Configuration + Constants + Messages]
    end

    subgraph Runtime
      SW[Service Worker]
      Manifest[PWA Manifest]
    end

    UI --> Ctrl
    Ctrl --> Engine
    Engine --> Rules
    Engine --> Score
    Engine --> Deal
    Ctrl --> AIMgr
    Ctrl --> Persist
    Ctrl --> Config
    SW --> UI
    Manifest --> UI
```

---

### Deployment Architecture

```mermaid
graph LR
    Browser[Browser Runtime] --> HTML[index.html]
    HTML --> JS[index.js + bundled modules]
    JS --> Assets[img/deck/**/*.svg]
    JS --> Storage[localStorage]
    JS --> SW[sw.js]
    SW --> Cache[Cache Storage]
```

---

### Human Turn Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as GameController
    participant E as GameEngine
    participant V as GameView

    U->>C: click legal card
    C->>E: getLegalActions(currentPlayerIndex)
    E-->>C: legal actions
    C->>E: playAction(currentPlayerIndex, selectedAction)
    E-->>C: updated state
    C->>V: render(updated state)
```

---

### AI Turn Sequence Diagram

```mermaid
sequenceDiagram
    participant C as GameController
    participant A as AI Manager
    participant E as GameEngine
    participant V as GameView

    C->>A: getAIMove(state, index, level)
    A-->>C: move or null
    C->>E: playAction(aiIndex, move)
    E-->>C: updated state
    C->>V: render(updated state)
```

---

### Talon Visual State Sequence

```mermaid
sequenceDiagram
    participant E as Engine State
    participant V as View Renderer

    E-->>V: talon.length, talonClosed, atoutCard
    alt open (talon.length > 0 and talonClosed=false)
      V->>V: show talon backface over open Atout
    else closed (talon.length > 0 and talonClosed=true)
      V->>V: show Atout as backface above talon
    else exhausted (talon.length == 0)
            V->>V: hide talon and Atout card stack
            V->>V: keep Atout suit icon visible
    end
```

---

### Game Flow Chart

```mermaid
flowchart TD
    A[Start Match] --> B[Deal 5 cards each + reveal Atout]
    B --> C{Talon open?}
    C -->|Yes| D[Play trick with open-talon rules]
    D --> E[Winner draws first, loser draws second]
    E --> F{close talon action?}
    F -->|Yes| G[Switch to strict play]
    F -->|No| C

    C -->|No| G
    G --> H[Play trick with strict legality]
    H --> I{Hand end reached?}
    I -->|No| G
    I -->|Yes| J[Compute hand winner and game points]
    J --> K{Match target reached?}
    K -->|No| B
    K -->|Yes| L[Match Over]
```

---

### Trick Resolution Flow Chart

```mermaid
flowchart TD
    A[Leader plays card] --> B[Follower legal cards computed]
    B --> C[Follower plays card]
    C --> D[determineTrickWinner]
    D --> E[add trick cards to winner pile]
    E --> F[apply deferred marriage points if eligible]
    F --> G{Talon open and not exhausted?}
    G -->|Yes| H[draw winner then loser]
    G -->|No| I[no draw]
    H --> J[next trick leader = winner]
    I --> J
```

---

### Atout Swap Flow Chart

```mermaid
flowchart TD
    A[Player turn in PlayingOpen] --> B{Leader to move and trick not started?}
    B -->|No| C[Swap not available]
    B -->|Yes| D{Talon open and talon.length > 2?}
    D -->|No| C
    D -->|Yes| E{Has lowest Atout rank?}
    E -->|No| C
    E -->|Yes| F[Dispatch action: swap-atout]
    F --> G[Engine validates swap preconditions]
    G --> H[Swap open Atout with lowest Atout from hand]
    H --> I[Update status message and render]
```

---

### Marriage Announcement Flow Chart

```mermaid
flowchart TD
    A[Leader turn before first card of trick] --> B{King+Ober pair on hand?}
    B -->|No| C[No marriage action offered]
    B -->|Yes| D[Offer announce-marriage by suit]
    D --> E[Player chooses announce-marriage]
    E --> F[Set pendingMarriageIntent]
    F --> G[Restrict legal lead to suited König/Ober]
    G --> G2[Block second announce-marriage in same lead]
    G2 --> H[Play suited König/Ober]
    H --> I[Apply marriage points immediate or deferred]
    I --> M{Leader wins trick and leads again?}
    M -->|Yes| N[Second marriage may be announced on next lead]
    M -->|No| O[No second marriage announcement]
    D --> J[Player skips announce]
    J --> K[Normal lead card play]
    K --> L[No marriage points awarded]
```

---

### Pre-Lead Edge-Case Workflow Flow Chart

```mermaid
flowchart TD
    A[Leader turn with open talon and no lead card played] --> B[Optional swap-atout]
    B --> C{announce-marriage first?}
    C -->|No| D[Optional close-talon]
    D --> E[announce-marriage]
    E --> F{points >= 66?}
    F -->|Yes| G[declare-66 and end hand]
    F -->|No| H[lead announced König/Ober]

    C -->|Yes| I[announce-marriage sets pendingMarriageIntent]
    I --> J{close-talon legal now?}
    J -->|Yes| K[close-talon accepted]
    J -->|No| L[skip close-talon]
    K --> M{points >= 66?}
    L --> M
    M -->|Yes| G
    M -->|No| H
```

---

### Player Seat Presentation Flow Chart

```mermaid
flowchart TD
    A[Render board] --> B[Keep fixed seat layout: South bottom, North top]
    B --> C{currentPlayerIndex}
    C -->|0 South active| D[Render South hand face-up and clickable]
    C -->|1 North active| E[Render North hand face-up and clickable]
    D --> F[Render North hand as backfaces]
    E --> G[Render South hand as backfaces]
    F --> H[Action buttons dispatch to active player index]
    G --> H
```

---

### Talon Visual State Flow Chart

```mermaid
flowchart TD
    A[Trick resolves in open talon] --> B{talon cards available after winner draw?}
    B -->|Yes| C[Loser draws next talon card]
    B -->|No, only open Atout remains| D[Loser receives open Atout card]
    C --> E[Continue open play]
    D --> F[Switch to exhausted strict play]

    G[Render board] --> H{talon.length == 0?}
    H -->|Yes| I[State = exhausted]
    H -->|No| J{talonClosed?}
    J -->|Yes| K[State = closed]
    J -->|No| L[State = open]

    L --> M[Show talon over open Atout + suit icon]
    K --> N[Show talon + Atout backface above talon + suit icon]
    I --> O[Hide talon and Atout card stack; keep suit icon]
```
