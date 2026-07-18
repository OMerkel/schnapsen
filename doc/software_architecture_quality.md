# Software Architecture Quality

## Testing Strategy

### Test Pyramid

```text
        Integration and UI shell tests
                  /
          Rules/engine module tests
                /
      constants, messages, and helpers
```

The project prioritizes deterministic rule tests and adds focused integration
coverage for controller/view shell behavior.

### Test Execution

```bash
npm run test -- --run
npm run test:coverage
npm run lint
npm run lint:md
```

### Current Test Areas

The active suite covers:

- card modeling and serialization;
- deck creation, seeded shuffle, and dealing;
- open-talon and strict-play legality;
- Atout swap legality and action transitions (FR-TAL-006, FR-TAL-007);
- explicit marriage announce and follow-up scoring path (FR-MRG-009,
  FR-MRG-010, FR-MRG-011);
- trick resolution, marriage scoring, and hand scoring;
- game engine transitions and match progression;
- AI move legality and level behavior;
- persistence save/resume behavior;
- PWA manifest and shell behavior;
- UI shell rendering including talon visual states (`open`, `closed`,
  `exhausted`), Atout swap button enablement, fixed South/North active-hand
  face-up projection, and active-player action dispatch.

Coverage and quality expectations:

- project-wide coverage floor follows `requirements.md` (`TST-COV-002`);
- critical rule paths are protected by deterministic unit tests;
- documentation and requirements traceability is enforced via mapped scenario
  comments in tests.

---

## Deployment and Build

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Build/runtime characteristics:

- Vite serves and builds from `javascript/html5/src`;
- output is emitted to `javascript/html5/dist`;
- relative asset paths support static hosting;
- service worker caches app shell and deck assets for offline use.

---

## NFR Compliance

### Performance

- UI interactions remain responsive through lightweight synchronous rule checks.
- AI delay is bounded by configured level timings in controller scheduling.

### Code Quality

- Biome enforces formatting/linting consistency.
- Vitest covers logic and UI shell behavior.
- Markdownlint protects architecture and requirements docs.

### Maintainability

- Modules are grouped by domain (core, ai, ui, persistence, config).
- Game rules stay centralized in `core/rules.js` and `core/scoring.js`.
- UI state is derived from engine state, reducing duplicated logic.

### Accessibility and Usability

- Keyboard interaction exists for shell/menu controls.
- Clear status messages are centralized in `config/messages.js`.
- Badge and talon overlays are rendered with semantic labels in UI markup.

### Offline/PWA

- Install metadata is provided by `manifest.json`.
- `sw.js` caches shell and card assets for offline startup and replay.

---

## Main Risks and Mitigations

- **Rule regression risk**: mitigated by dense rule/engine test coverage.
- **UI drift risk**: mitigated by `schnapsen-ui-shell.test.js` integration tests.
- **Persistence schema risk**: mitigated by schema-versioned state payload.
- **Documentation drift risk**: mitigated by synchronized updates across
  requirements, gherkin, and architecture docs.
