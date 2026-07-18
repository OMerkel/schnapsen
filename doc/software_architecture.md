# Schnapsen - Software Architecture

## Architecture Overview

This document defines the software architecture for the digital implementation of
Schnapsen in HTML5/JavaScript. The architecture is organized around
**separation of concerns**, **modularity**, and **testability** to support the
formal requirements in [requirements.md](requirements.md) and the active
JavaScript test suite.

### High-Level Design Principles

1. **Layered Architecture**: Presentation -> Game Logic -> AI -> Persistence
2. **Modular Components**: deck, rules, scoring, engine, UI, and persistence are
   isolated modules
3. **State-Driven Rendering**: UI is derived from immutable-style match state
4. **Deterministic Core Rules**: legality and trick resolution are pure
   functions, independent from DOM
5. **Offline-First PWA**: app shell and card assets are cached by service worker

---

## Project Structure

```text
schnapsen/
|-- javascript/
|   `-- html5/
|       |-- src/
|       |   |-- index.html                 # Entry point; UI shell
|       |   |-- index.js                   # App bootstrap
|       |   |-- manifest.json              # PWA install metadata
|       |   `-- sw.js                      # Service worker
|       |   |-- css/                       # Stylesheets
|       |   |-- core/                      # Rules and game engine
|       |   |-- ai/                        # AI move generation
|       |   |-- persistence/               # Save/load state and settings
|       |   |-- ui/                        # Controller and view
|       |   |-- config/                    # Constants, settings, messages
|       |   |-- utils/                     # Shared utilities (logger)
|       |   |-- img/                       # Card assets
|       |   `-- test/                      # Vitest suite
|       |-- package.json
|       |-- vite.config.js
|       `-- vitest.config.js
`-- doc/
    |-- requirements.md                    # Formal requirements
    |-- rules.md                           # English rules
    |-- regeln.md                          # German rules
    |-- gherkin.md                         # Scenario descriptions
    |-- software_architecture.md           # This index document
    |-- software_architecture_modules.md   # Module-level responsibilities
    |-- software_architecture_runtime.md   # Runtime flows and interactions
    |-- software_architecture_quality.md   # Testing, build, NFRs
    `-- software_architecture_diagrams.md  # Architecture and flow diagrams
```

---

## Architecture Document Map

This document is the entry point for the split architecture set:

- [software_architecture_modules.md](software_architecture_modules.md):
  file-level responsibilities, algorithms, and architectural roles
- [software_architecture_runtime.md](software_architecture_runtime.md):
  initialization, talon and trick runtime flow, and component interactions
- [software_architecture_quality.md](software_architecture_quality.md): testing
  strategy, build/deployment model, and non-functional requirements
- [software_architecture_diagrams.md](software_architecture_diagrams.md):
  class, sequence, flow, and state-chart diagrams

---

## System Scope

The browser application is responsible for:

- modeling Schnapsen deck variants (20 and 24 cards) and card values;
- validating open-talon and strict-play legality;
- resolving tricks and winner transitions;
- handling Atout and talon states (`open`, `closed`, `exhausted`);
- enforcing Atout swap legality while talon is open (24-card lowest Atout: 9,
  20-card lowest Atout: Unter) and rejecting it when talon is closed;
- enforcing explicit marriage announcement before marriage scoring and applying
  no marriage points when announcement is missed;
- supporting reorderable pre-lead action workflows across swap-atout,
  close-talon, announce-marriage, and declare-66, including edge-case
  sequencing where close-talon occurs after announce-marriage, provided each
  action's preconditions are met at that step;
- applying marriage scoring (20 non-Atout, 40 Atout) with deferred scoring rules;
- preserving fixed seat presentation (South/North) while showing only active
  hand cards face-up and rendering inactive hand cards as backfaces;
- routing action-panel and card-play controls to the currently active player;
- scoring hands and Bummerl match progression;
- supporting human and AI-driven turns through a shared engine;
- persisting settings and resumable game state in local storage;
- supporting static deployment and offline-capable PWA runtime.

---

## Key Design Decisions

- **State-first engine**: `core/game-engine.js` orchestrates transitions, while
  legality/scoring are delegated to dedicated rule modules.
- **Pure legality functions**: `core/rules.js` provides deterministic trick and
  move legality checks, reusable by UI and AI.
- **Explicit Atout swap contract**: swap preconditions are centralized in
  `core/rules.js` and orchestrated by `core/game-engine.js` as a legal action.
- **Explicit marriage contract**: marriage is a two-step sequence (`announce-marriage`
  then suited King/Ober lead); skipped announcements score zero marriage points.
- **Atout/Talon visual model**: UI derives visual stack behavior directly from
  state (`open`, `closed`, `exhausted`) instead of keeping duplicated UI flags.
- **Fixed seat projection**: UI keeps South/North seat positions constant and
  toggles face-up/backface visibility by active turn only.
- **Single AI entrypoint**: `ai/ai-manager.js` returns legal actions only and
  keeps level-specific behavior in one module.
- **Schema-versioned persistence**: save data includes schema version for safe
  forward migration and resume behavior.
- **Doc-test traceability**: requirements and gherkin scenarios map directly to
  tests in `src/test`.
- **Relative asset paths**: runtime references `img/deck/...` for consistent
  behavior in dev server and static build output.

---

## Future Extensibility

The architecture supports these potential enhancements:

1. **Network Multiplayer**: replace local AI turns with remote turn source while
   preserving core legality modules.
2. **Richer Analytics**: extend persistence with historical game analytics.
3. **Additional AI strategies**: split advanced heuristics from `ai-manager`
   into dedicated strategy modules if complexity grows.
4. **Replay/Undo Tooling**: leverage deterministic state transitions and hand
   history.
5. **Rule Variants**: add optional rule toggles without coupling into UI logic.
6. **Alternative card themes**: swap card/suit assets while preserving runtime
   rendering contracts.

---

## Summary

This architecture provides a **scalable, testable, and maintainable**
implementation of Schnapsen in HTML5/JavaScript. It organizes code into clear
modules for core logic, AI, UI, persistence, configuration, and assets while
keeping rule behavior deterministic and UI rendering state-driven.
