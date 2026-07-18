# Schnapsen

Implementation and specification workspace for a two-player Schnapsen game.

This repository combines:

- Formal game/rules and requirement documents
- A browser-based HTML5/PWA implementation
- Automated tests with requirement traceability comments

## Play Online

- [Start game now...](https://omerkel.github.io/schnapsen/javascript/html5/src/)

## What Is In This Repo

```text
doc/                  Rulebook, requirements, and Gherkin scenario artifacts
javascript/html5/     Main runnable implementation (Vite + Vitest + Biome)
```

## Start Here

1. Read gameplay and specification docs:
   - [doc/rules.md](doc/rules.md)
   - [doc/requirements.md](doc/requirements.md)
   - [doc/gherkin.md](doc/gherkin.md)
   - [doc/gherkin-sync-section.md](doc/gherkin-sync-section.md)
2. Open the implementation guide:
   - [javascript/html5/README.md](javascript/html5/README.md)

## HTML5 App Quick Start

```bash
cd javascript/html5
npm install
npm run dev
```

Useful commands:

```bash
npm run test -- --run
npm run test:coverage
npm run lint
npm run format
npm run ci
```

## Runtime Entry Points

- App shell: [javascript/html5/src/index.html](javascript/html5/src/index.html)
- Bootstrap: [javascript/html5/src/index.js](javascript/html5/src/index.js)
- PWA manifest: [javascript/html5/src/manifest.json](javascript/html5/src/manifest.json)
- Service worker: [javascript/html5/src/sw.js](javascript/html5/src/sw.js)

## Core Architecture (HTML5)

- Rules/game flow engine: `src/core/`
- AI logic: `src/ai/`
- UI controller and renderer: `src/ui/`
- Persistence: `src/persistence/`
- Tests: `src/test/`

Detailed layout and conventions are documented in
[javascript/html5/README.md](javascript/html5/README.md).

## Software Architecture Docs

Architecture documentation is split into focused documents:

- [doc/software_architecture.md](doc/software_architecture.md)
- [doc/software_architecture_modules.md](doc/software_architecture_modules.md)
- [doc/software_architecture_runtime.md](doc/software_architecture_runtime.md)
- [doc/software_architecture_quality.md](doc/software_architecture_quality.md)
- [doc/software_architecture_diagrams.md](doc/software_architecture_diagrams.md)

## Documentation Synchronization

The project uses explicit requirement traceability:

- Test cases include `Req IDs` comments.
- Gherkin scenario wording is maintained in [doc/gherkin.md](doc/gherkin.md).
- The current test-derived mapping lives in
  [doc/gherkin-sync-section.md](doc/gherkin-sync-section.md).

When behavior changes, update tests and docs together.

## Card Asset Notes

Deck assets for the German set are generated in:

- [javascript/html5/src/img/deck/merkel_deutsch/generate_cards_german_simple.py](javascript/html5/src/img/deck/merkel_deutsch/generate_cards_german_simple.py)

Run this generator when card layout/symbol generation logic changes.

## Contributing Expectations

- Keep terminology strictly Schnapsen-specific.
- Preserve deterministic core rules behavior.
- Keep tests passing and coverage healthy.
- Keep `requirements.md`, `gherkin.md`, and test `Req IDs` aligned.
