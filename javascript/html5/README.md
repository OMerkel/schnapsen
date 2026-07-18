# Schnapsen - HTML5/JavaScript PWA

Modern browser implementation of the two-player trick-taking card game Schnapsen.

This project is the HTML5 frontend/runtime of the repository and is built with:

- Vite (development/build)
- Vitest (unit tests)
- Biome (lint/format)
- PWA manifest + service worker (offline-friendly app shell)

## Overview

The app implements Schnapsen core game flow for 20-card and 24-card variants,
with human/AI players, persistence, and in-app overlays for rules/options.

Core objectives in this codebase:

- Deterministic, testable rules engine modules
- Clear separation between core logic, AI, UI, and persistence
- Strong automated test coverage with requirement traceability comments

## Project Structure

```text
src/
├── ai/
│   └── ai-manager.js
├── config/
│   ├── configuration.js
│   ├── constants.js
│   └── messages.js
├── core/
│   ├── card.js
│   ├── dealing.js
│   ├── deck.js
│   ├── game-engine.js
│   ├── game-state.js
│   ├── rules.js
│   └── scoring.js
├── css/
├── img/
├── persistence/
│   └── persistence-manager.js
├── test/
│   ├── schnapsen-ai.test.js
│   ├── schnapsen-card.test.js
│   ├── schnapsen-configuration-and-messages.test.js
│   ├── schnapsen-deck-and-dealing.test.js
│   ├── schnapsen-engine.test.js
│   ├── schnapsen-persistence.test.js
│   ├── schnapsen-pwa-config.test.js
│   ├── schnapsen-rules.test.js
│   ├── schnapsen-scoring.test.js
│   └── schnapsen-ui-shell.test.js
├── ui/
│   ├── game-controller.js
│   └── game-view.js
├── utils/
├── workers/
├── index.html
├── index.js
├── manifest.json
└── sw.js
```

## Quick Start

### Prerequisites

- Node.js 18+ recommended
- npm 7+

### Install

```bash
cd javascript/html5
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build Production Bundle

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Test and Quality Commands

### Run Tests

```bash
npm test -- --run
```

### Run Coverage

```bash
npm run test:coverage
```

Coverage thresholds are configured in `vitest.config.js` and currently require:

- lines >= 96
- statements >= 96
- functions >= 96
- branches >= 96

Note: UI and entry/runtime files are intentionally excluded from strict coverage
threshold checks in the current configuration.

### Lint and Format

```bash
npm run lint
npm run lint:fix
npm run format
```

### CI Command

```bash
npm run ci
```

## PWA and Offline

- Manifest: `src/manifest.json`
- Service worker: `src/sw.js`
- Runtime bootstrap: `src/index.js` registers service worker best-effort

The app is designed so gameplay initialization does not fail if service worker
registration is unavailable.

## Rules and Requirements Sources

For canonical rules and formal requirements, use repository docs:

- `doc/rules.md`
- `doc/requirements.md`
- `doc/gherkin.md`
- `doc/gherkin-sync-section.md`

## Test Traceability Convention

Tests in `src/test/*.test.js` use comments with:

- Scenario
- Feature
- Given/When/Then/And
- Req IDs

This enables traceability between:

- implemented test behavior
- requirement IDs in `doc/requirements.md`
- scenario wording in `doc/gherkin.md`

## Notes for Contributors

- Keep terminology strictly Schnapsen-specific.
- Avoid introducing legacy terms from previous game variants in code or documentation.
- When behavior changes, update both tests and docs in the same change set.
- Keep requirement mappings semantically valid (do not attach unrelated Req IDs).
