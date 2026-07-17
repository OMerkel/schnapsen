# Software Requirements Specification (SRS)

Project: Schnapsen PWA (HTML5 / modern JavaScript)

Source of business rules: [doc/rules.md](rules.md)
Primary runtime entry point: [javascript/html5/src/index.html](../javascript/html5/src/index.html)

## 1. Purpose and Scope

This document defines formal, testable requirements for implementing a two-player Schnapsen game as an installable, offline-capable Progressive Web Application (PWA). It is intended to be referenced by implementation tickets and automated/manual test cases.

## 2. Conventions

- Requirement IDs are stable and unique.
- "Shall" denotes mandatory behavior.
- Functional requirements (FR) are grouped by domain for direct mapping to test suites.
- Non-functional requirements (NFR) are grouped by quality attribute.

## 3. Product Configuration Defaults

- Default deck variant: 24-card deck.
- Alternate deck variant: 20-card deck selectable in the in-app Options menu.
- Player slots: exactly two.
- For each player slot, selectable player type: Human or AI.
- If player type is AI, selectable difficulty level: Easy, Medium, Hard.
- Match target score default: first to 7 game points (Bummerl).

## 4. Functional Requirements

### 4.1 Game Modes and Options (Suite: OptionsAndSetup)

- FR-OPT-001: The application shall provide an in-app Options menu reachable from the main menu and from an in-match pause/settings entry.
- FR-OPT-002: The Options menu shall expose a Deck Variant control with values: 24-card and 20-card.
- FR-OPT-003: The Deck Variant default shall be 24-card for first run and when settings are reset.
- FR-OPT-004: The selected Deck Variant shall be applied to every newly started match.
- FR-OPT-005: The Options menu shall expose Player 1 type with values: Human, AI.
- FR-OPT-006: The Options menu shall expose Player 2 type with values: Human, AI.
- FR-OPT-007: When a player type is set to AI, that player shall have an AI Level control with values: Easy, Medium, Hard.
- FR-OPT-008: When a player type is set to Human, AI Level for that slot shall be hidden or disabled and not used by game logic.
- FR-OPT-009: Option changes shall be persisted locally and restored on next app launch.
- FR-OPT-010: A "Restore Defaults" action shall reset options to: 24-card deck, Player 1 Human, Player 2 Human.

### 4.2 Deck Composition and Card Values (Suite: DeckAndCards)

- FR-CRD-001: In 20-card mode, each suit shall contain: Ass, Zehn, Konig, Ober, Unter.
- FR-CRD-002: In 24-card mode, each suit shall contain: Ass, Zehn, Konig, Ober, Unter, 9.
- FR-CRD-003: Card point values shall be: Ass=11, Zehn=10, Konig=4, Ober=3, Unter=2, 9=0.
- FR-CRD-004: The total value of counting trick cards shall be 120 points in both variants.
- FR-CRD-005: Trick rank order in 20-card mode shall be: Ass > Zehn > Konig > Ober > Unter.
- FR-CRD-006: Trick rank order in 24-card mode shall be: Ass > Zehn > Konig > Ober > Unter > 9.
- FR-CRD-007: Cards shall be rendered as SVG assets or SVG-generated elements.

### 4.3 Hand Initialization and Deal Flow (Suite: DealAndStart)

- FR-DAL-001: At hand start, dealer shall be selected uniformly at random.
- FR-DAL-002: Each player shall receive exactly 5 cards.
- FR-DAL-003: Remaining cards shall form the talon (stock) as a face-down pile.
- FR-DAL-004: The top talon card shall be revealed and define trump suit.
- FR-DAL-005: The non-dealer shall lead the first trick.

### 4.4 Trick Play with Open Talon (Suite: OpenTalonPlay)

- FR-OPN-001: While talon is open, leader shall be allowed to play any legal card from hand.
- FR-OPN-002: While talon is open, follower shall be allowed to play any legal card from hand (no forced follow-suit).
- FR-OPN-003: Trick winner shall be highest card of led suit unless at least one trump is played.
- FR-OPN-004: Any trump shall beat any non-trump.
- FR-OPN-005: If both played cards are trumps, higher trump rank shall win.
- FR-OPN-006: After each trick while talon is open, trick winner shall draw first from talon, then trick loser shall draw second.
- FR-OPN-007: Trick winner shall lead the next trick.

### 4.5 Strict Play (Talon Exhausted or Closed) (Suite: StrictPlay)

- FR-STR-001: When talon is exhausted or closed, strict legality rules shall apply.
- FR-STR-002: A player shall follow suit if possible.
- FR-STR-003: If following suit and able to beat the current winning card, player shall head the trick.
- FR-STR-004: If follow suit is impossible, player shall play trump if possible.
- FR-STR-005: Only when neither follow-suit nor trump is possible, player may play any card.

### 4.6 Marriage (Suite: MarriageScoring)

- FR-MRG-001: Marriage announcement shall be allowed only by the active leader.
- FR-MRG-002: Marriage announcement shall require leader to play Konig or Ober of a suit while holding the matching partner card in hand.
- FR-MRG-003: On announcement, UI shall reveal/indicate both marriage cards and still play exactly one card to the current trick.
- FR-MRG-004: Non-trump marriage shall be worth 20 points.
- FR-MRG-005: Trump marriage shall be worth 40 points.
- FR-MRG-006: Marriage points shall count only if announcing player wins at least one trick in the hand.
- FR-MRG-007: If announcing player already has at least one trick, marriage points shall be applied immediately.
- FR-MRG-008: If announcing player has no trick yet, marriage points shall be deferred and applied when that player wins first trick.

### 4.7 Closing Talon (Suite: TalonClose)

- FR-TAL-001: Closing talon shall be allowed only when talon is open.
- FR-TAL-002: Closing talon shall be allowed only for the active leader before leading a card.
- FR-TAL-003: After closing talon, no player shall draw from talon for the rest of the hand.
- FR-TAL-004: After closing talon, strict play rules shall apply immediately from the same trick onward.
- FR-TAL-005: If the player who closed talon fails to reach 66 in the hand, that player shall lose the hand.

### 4.8 Hand End and Hand Scoring (Suite: HandResolution)

- FR-END-001: A hand shall end immediately when a player reaches and declares 66 or more points.
- FR-END-002: If neither player declares 66 before all cards are played, hand shall continue to final trick.
- FR-END-003: Winner of final trick in full-play end shall receive a 10-point last-trick bonus.
- FR-END-004: In full-play end, hand winner shall be player with higher total points after last-trick bonus.
- FR-END-005: Winner shall receive 1 game point if loser has 33 or more card points.
- FR-END-006: Winner shall receive 2 game points if loser has 0 to 32 card points.
- FR-END-007: Winner shall receive 3 game points if loser won no trick.
- FR-END-008: If talon was closed and closer fails to reach 66, opponent shall receive game points per FR-END-005 to FR-END-007.

### 4.9 Match Progression (Suite: MatchScoring)

- FR-MAT-001: Match shall accumulate hand-level game points (Bummerl) per player.
- FR-MAT-002: Match shall end when a player reaches 7 game points.
- FR-MAT-003: Match summary shall display hand history, per-hand score outcome, and final match winner.
- FR-MAT-004: Terminology in UI/help shall include both "game points" and "Bummerl".

### 4.10 AI Behavior and Legality (Suite: AIEngine)

- FR-AI-001: AI players shall only output legal actions under current rule regime.
- FR-AI-002: AI shall support three levels: Easy, Medium, Hard.
- FR-AI-003: Easy AI shall use a basic strategy profile with primarily local, short-horizon decisions.
- FR-AI-004: Medium AI shall use an intermediate strategy profile using game state features beyond immediate trick value.
- FR-AI-005: Hard AI shall use an advanced strategy profile with stronger tactical and scoring optimization.
- FR-AI-006: For deterministic test mode, AI decision function shall accept a seed and produce repeatable decisions for identical state+seed.
- FR-AI-007: AI move computation shall be interrupt-safe and shall not block UI beyond NFR performance limits.

### 4.11 Persistence and Resume (Suite: Persistence)

- FR-PRS-001: The app shall persist settings, current match state, and current hand state in local browser storage.
- FR-PRS-002: Persisted hand state shall include deck variant, talon order, hands, won tricks, marriage pending/applied status, turn, and score.
- FR-PRS-003: On app relaunch offline, user shall be able to resume the interrupted match.
- FR-PRS-004: Save-state schema shall include a version field for migration compatibility.

### 4.12 UI and Rules Visibility (Suite: UIAndRules)

- FR-UIR-001: The app shall provide an in-app rules/help screen summarizing gameplay rules from [doc/rules.md](rules.md).
- FR-UIR-002: The UI shall clearly indicate trump suit, current leader, talon status (open/closed/exhausted), and current points.
- FR-UIR-003: The UI shall indicate pending/deferred marriage points and when they are converted into score.
- FR-UIR-004: The UI shall prevent illegal card selection and provide reason feedback.

### 4.13 UI Components: Hamburger Menu, Title Bar, and Badge System (Suite: UIComponents)

#### 4.13.1 Hamburger Side Bar Menu (FR-UI-H1)

- FR-UI-H1-001: A hamburger toggle control must be visible in the title bar on all primary app screens.
  - Control is keyboard-focusable, has accessible name (e.g., "Open navigation menu"), and indicates expanded/collapsed state.
  
- FR-UI-H1-002: Activating the hamburger control opens the side bar menu; activating again closes it.
  - Menu may slide in from the configured side (default left). Open/close animation duration must be consistent and non-blocking.
  
- FR-UI-H1-003: The side bar menu must close on: (a) selecting a navigation item, (b) pressing `Esc`, (c) clicking/tapping outside the menu area.
  
- FR-UI-H1-004: Each menu item must map to a deterministic target (route/view/action).
  - Active route/item is visually indicated; disabled items are non-interactive.
  
- FR-UI-H1-005: When menu opens, focus moves to first actionable element in the menu; when closed, focus returns to hamburger toggle.
  - Keyboard navigation uses logical tab order; screen readers announce menu region and item labels.
  
- FR-UI-H1-006: Menu behavior must adapt by viewport: on mobile it is an overlay drawer over content; on desktop it may be overlay or push mode per configuration.

#### 4.13.2 Title Bar (FR-UI-T1)

- FR-UI-T1-001: Title bar must include: (a) hamburger toggle, (b) screen/page title, (c) primary status/action region (e.g., badges, profile, settings shortcut).
  
- FR-UI-T1-002: Title text must reflect current route/view context and update on navigation without full page reload.
  
- FR-UI-T1-003: Title bar remains visible during vertical scroll on supported screens without overlapping critical content.
  
- FR-UI-T1-004: Title bar actions must follow priority order (critical > primary > secondary overflow).
  - On small screens, low-priority actions collapse into overflow menu.
  
- FR-UI-T1-005: Interactive title bar controls must meet minimum target size (44×44 CSS px) and keyboard operability.

#### 4.13.3 Badge System (FR-UI-B1)

- FR-UI-B1-001: System must support at least: (a) numeric badges (counts), (b) dot badges (presence/attention), (c) status badges (label-based, e.g., "New", "Syncing", "Error").
  
- FR-UI-B1-002: Numeric badges must format counts consistently: `0` hides badge by default (configurable); values above max threshold display compact form (e.g., `99+`).
  
- FR-UI-B1-003: Badge values must be bound to defined data sources and update reactively without requiring manual refresh.
  
- FR-UI-B1-004: Badge colors must use semantic tokens (info/success/warning/error) and maintain contrast compliance per WCAG 2.2 AA.
  
- FR-UI-B1-005: Badges attached to icons/menu items must maintain consistent anchor position and not clip at common breakpoints/scales.
  
- FR-UI-B1-006: Changes in important badge counts (e.g., game state notifications) must be announced to assistive tech with appropriate live-region politeness.

## 5. Non-Functional Requirements

### 5.1 PWA and Offline (Suite: PWAOffline)

- NFR-PWA-001: The application shall be installable as a standards-compliant PWA.
- NFR-PWA-002: A service worker shall precache the app shell and essential static assets including SVG cards.
- NFR-PWA-003: After first successful load, full gameplay (new match and resume) shall work without network.
- NFR-PWA-004: Offline startup shall not show blocking errors due to missing network resources.

### 5.2 Performance (Suite: Performance)

- NFR-PERF-001: Time to interactive on a mid-range mobile profile shall be <= 3.0 seconds for cached load.
- NFR-PERF-002: UI response from card click/tap to rendered state change shall be <= 100 ms (95th percentile).
- NFR-PERF-003: AI turn decision latency shall be <= 150 ms (Easy), <= 400 ms (Medium), <= 1000 ms (Hard) on reference desktop hardware.

### 5.3 Reliability and Correctness (Suite: Reliability)

- NFR-REL-001: Rules engine shall be implemented as deterministic pure logic module for identical state+action input.
- NFR-REL-002: Illegal state transitions shall be rejected with explicit error codes.
- NFR-REL-003: Unhandled exceptions in gameplay flow shall be prevented; user shall receive recoverable error UI.

### 5.4 Security and Privacy (Suite: Security)

- NFR-SEC-001: No backend account or personal data collection shall be required for core gameplay.
- NFR-SEC-002: Application shall avoid unsafe dynamic code execution patterns (e.g., eval) in production.
- NFR-SEC-003: Stored local data shall be limited to settings and game state; no secret tokens shall be stored.

### 5.5 Accessibility and Usability (Suite: Accessibility)

- NFR-ACC-001: Core gameplay shall be keyboard operable.
- NFR-ACC-002: Controls and game status indicators shall expose accessible names/roles.
- NFR-ACC-003: Color contrast for critical UI elements shall meet WCAG 2.2 AA.
- NFR-ACC-004: Card/suit indicators shall not rely on color alone.

### 5.6 Compatibility and Maintainability (Suite: CompatibilityAndCodeQuality)

- NFR-CMP-001: App shall support latest two stable versions of Chromium, Firefox, Edge, and Safari.
- NFR-MNT-001: Source code shall be modularized by domain: rules engine, AI, UI, persistence, and PWA runtime.
- NFR-MNT-002: Build and test pipeline shall run in CI with deterministic dependency resolution.
- NFR-MNT-003: Requirement IDs shall be referenced in implementation tickets and test cases.

### 5.7 UI Performance and Responsiveness (Suite: UIPerformance)

- NFR-UI-PERF-001: Menu open/close interaction response must start within 100 ms of user input and complete animation within 300 ms.
  
- NFR-UI-PERF-002: Badge updates must render within 200 ms after state change.
  
- NFR-UI-PERF-003: Title bar route transitions must complete within 150 ms without blocking user interaction.

### 5.8 UI Reliability and Stability (Suite: UIReliability)

- NFR-UI-REL-001: Title bar, hamburger menu, and badge controls must remain functional after route transitions and offline/online state changes.
  
- NFR-UI-REL-002: Focus management and menu state must recover gracefully from rapid open/close interactions.
  
- NFR-UI-REL-003: Badge-binding failure (e.g., missing data source) shall not crash UI; fallback or error state must be rendered.

## 6. Verification and Coverage Requirements

### 6.1 Automated Testing Coverage (Suite: Coverage)

- TST-COV-001: Rules engine core (deal, legality, trick resolution, scoring, marriage, talon close, hand end) shall achieve 100% line and branch coverage.
- TST-COV-002: Project-wide coverage floor shall be >= 90% lines and >= 85% branches.
- TST-COV-003: Every FR and NFR in this document shall have at least one linked test case identifier.

### 6.2 Test Suite Structure Requirements

- TST-STR-001: Test classes/suites shall be organized to mirror requirement categories in section 4 and 5.
- TST-STR-002: Each test case shall include requirement references (e.g., FR-MRG-004, NFR-PWA-003).
- TST-STR-003: E2E matrix shall cover all player combinations (H/H, H/AI, AI/H, AI/AI) across both deck variants.
- TST-STR-004: E2E matrix shall cover AI levels Easy, Medium, Hard in at least one scenario per level and deck variant.

### 6.3 Property and Scenario Testing

- TST-PBT-001: Property-based tests shall validate invariants: card conservation, point conservation (counting cards = 120), legality constraints, deterministic replay (seeded mode).
- TST-PBT-002: Scenario tests shall include at least: immediate 66 declaration, deferred marriage scoring release, talon close success, talon close failure, full-play last-trick bonus path.

### 6.4 UI Component Testing (Suite: UIComponentTests)

- TST-UI-001: Hamburger menu tests (FR-UI-H1-*) shall verify:
  - Menu toggle visibility and `aria-expanded` state on activation.
  - All three dismissal paths (item selection, `Esc`, outside click) close menu and return focus.
  - Keyboard tab order within menu and accessibility announcements.
  - Responsive behavior at mobile and desktop breakpoints.
  
- TST-UI-002: Title bar tests (FR-UI-T1-*) shall verify:
  - All required elements (hamburger, title, status) are present and properly positioned.
  - Title text updates on route transition.
  - Persistent visibility during scroll and no content occlusion.
  - Action priority collapse on small screens.
  - Keyboard focus and target size compliance.
  
- TST-UI-003: Badge tests (FR-UI-B1-*) shall verify:
  - Rendering of numeric, dot, and status badge types.
  - Count formatting (0 hides, overflow compaction, e.g., `99+`).
  - Reactive updates to backing state changes.
  - Semantic color tokens and contrast compliance.
  - Consistent positioning at multiple scales and viewport sizes.
  - Live-region announcements on significant count changes.
  
- TST-UI-004: Acceptance criteria (integration tests) shall include:
  - Mobile user opens hamburger, navigates to menu item, menu closes, focus returns to toggle.
  - Navigating to different view updates title immediately and keeps header sticky during scroll.
  - Badge shows `99+` at count 120, hides at count 0, announces change to screen reader.

## 7. Traceability Rules

- TRC-001: Ticket templates shall include a mandatory field "Requirement IDs".
- TRC-002: Test case templates shall include a mandatory field "Verifies Requirement IDs".
- TRC-003: Pull requests shall list implemented requirement IDs and added/updated tests per ID.

## 8. Out of Scope (Current Release)

- OOS-001: Online multiplayer over network.
- OOS-002: Account systems, cloud sync, or leaderboards.
- OOS-003: Rule variants beyond those described in [doc/rules.md](rules.md) and explicit options in this SRS.

## 9. Implementation Notes and Reference Structures

### 9.1 Title Bar and Side Panel HTML Structure

The title bar and side panel navigation menu should follow this structure (or semantic equivalent):

```html
<!-- Title Bar -->
<div id="title-bar">
  <button type="button" class="hamburger-btn" id="hamburger-btn" 
          aria-label="Open menu" aria-expanded="false" aria-controls="side-panel">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect y="2"  width="18" height="2" rx="1" fill="currentColor"/>
      <rect y="8"  width="18" height="2" rx="1" fill="currentColor"/>
      <rect y="14" width="18" height="2" rx="1" fill="currentColor"/>
    </svg>
  </button>
  <h1>Schnapsen</h1>
  <div id="game-badge" aria-label="Game status" aria-live="polite"></div>
</div>

<!-- Side Panel Overlay -->
<div id="side-panel-overlay" aria-hidden="true"></div>

<!-- Side Panel Navigation -->
<nav id="side-panel" aria-label="Application menu" aria-hidden="true">
  <button type="button" class="side-panel-item" id="sp-close">
    <span class="item-icon">✕</span> Close
  </button>
  <hr class="side-panel-divider" />
  <button type="button" class="side-panel-item" id="sp-new-game">
    <span class="item-icon">🎮</span> New game…
  </button>
  <button type="button" class="side-panel-item" id="sp-rules">
    <span class="item-icon">📖</span> Rules…
  </button>
  <button type="button" class="side-panel-item" id="sp-options">
    <span class="item-icon">⚙️</span> Options…
  </button>
  <button type="button" class="side-panel-item" id="sp-about">
    <span class="item-icon">ℹ️</span> About…
  </button>
</nav>
```

### 9.2 Implementation Guidance

- Hamburger button `aria-expanded` must sync with `side-panel` and `side-panel-overlay` visibility.
- Focus trap (if modal drawer): ensure Tab/Shift+Tab cycle within menu when open; restore focus to hamburger on close.
- Badge element (`#game-badge`) should use `aria-live="polite"` for announcements and `aria-label` for semantic description.
- Menu items may be extended with route data attributes or event listeners to map to navigation targets.
