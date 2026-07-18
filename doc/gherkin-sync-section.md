# Current Test Suite Synchronization

This snapshot is generated from test comments in `javascript/html5/src/test/*.test.js`.
Each test case should provide Scenario, Feature, and Req IDs aligned with this map.

## schnapsen-ai.test.js

- Scenario: returns legal action for current AI player
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001, FR-AI-002
- Scenario: declares 66 when threshold reached on lead
  - Feature: AI Behavior and Legality (FR-AI-005)
  - Req IDs: FR-AI-005, FR-END-001, FR-END-009
- Scenario: does not declare 66 when not on lead
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001, FR-END-009
- Scenario: returns null outside playing phase or wrong turn
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001
- Scenario: hard AI can choose close talon on strong lead
  - Feature: AI Behavior and Legality (FR-AI-005)
  - Req IDs: FR-AI-005, FR-TAL-001, FR-TAL-002
- Scenario: medium AI prefers marriage action when available
  - Feature: AI Behavior and Legality (FR-AI-004)
  - Req IDs: FR-AI-004, FR-MRG-001
- Scenario: returns null when pending marriage has no legal matching card
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001, FR-MRG-011
- Scenario: returns null when current player has no legal cards
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001, NFR-REL-003
- Scenario: evaluates follow-up trick play when one card is already on table
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001, FR-AI-003
- Scenario: supports easy medium and hard level outputs as legal actions
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001, FR-AI-002
- Scenario: evaluates leader cards with marriage bonus path in easy mode
  - Feature: AI Behavior and Legality (FR-AI-001)
  - Req IDs: FR-AI-001, FR-AI-003

## schnapsen-card.test.js

- Scenario: Create an Individual Card
  - Feature: Card Representation (FR-CRD-003, FR-CRD-007)
  - Req IDs: FR-CRD-003, FR-CRD-007
- Scenario: Card Equality Comparison
  - Feature: Card Equality (FR-CRD-003)
  - Req IDs: FR-CRD-003

## schnapsen-configuration-and-messages.test.js

- Scenario: normalizes invalid settings to defaults
  - Feature: Configuration and Messaging (FR-OPT-003)
  - Req IDs: FR-OPT-003, FR-OPT-010
- Scenario: merges patch settings and keeps normalization
  - Feature: Configuration and Messaging (FR-OPT-004)
  - Req IDs: FR-OPT-004, FR-OPT-007, FR-OPT-009
- Scenario: formats card and status messages
  - Feature: Configuration and Messaging (FR-MAT-004)
  - Req IDs: FR-MAT-004, FR-UIR-004

## schnapsen-deck-and-dealing.test.js

- Scenario: creates correct card counts for 20 and 24 card variants
  - Feature: Deck and Deal Flow (FR-CRD-001)
  - Req IDs: FR-CRD-001, FR-CRD-002
- Scenario: shuffles deterministically with seeded random
  - Feature: Deck and Deal Flow (NFR-REL-001)
  - Req IDs: NFR-REL-001
- Scenario: seeded random uses stable non-zero fallback for zero seed
  - Feature: Deck and Deal Flow (NFR-REL-001)
  - Req IDs: NFR-REL-001
- Scenario: deals 5 cards per player and exposes Atout card
  - Feature: Deck and Deal Flow (FR-DAL-002)
  - Req IDs: FR-DAL-002, FR-DAL-003, FR-DAL-004
- Scenario: draws winner first then loser
  - Feature: Deck and Deal Flow (FR-OPN-006)
  - Req IDs: FR-OPN-006
- Scenario: gives final face-down talon card to winner and open Atout to loser
  - Feature: Deck and Deal Flow (FR-OPN-008)
  - Req IDs: FR-OPN-006, FR-OPN-008
- Scenario: handles draw with empty talon without adding cards
  - Feature: Deck and Deal Flow (FR-OPN-006)
  - Req IDs: FR-OPN-006, FR-TAL-003

## schnapsen-engine.test.js

- Scenario: starts match and hand with correct base state
  - Feature: Hand Flow and Resolution (FR-DAL-001)
  - Req IDs: FR-DAL-001, FR-DAL-002, FR-DAL-003, FR-DAL-004, FR-DAL-005
- Scenario: allows close talon only for active leader before card
  - Feature: Hand Flow and Resolution (FR-TAL-001)
  - Req IDs: FR-TAL-001, FR-TAL-002
- Scenario: plays trick and advances turn
  - Feature: Hand Flow and Resolution (FR-OPN-007)
  - Req IDs: FR-OPN-007
- Scenario: distributes last talon card and open Atout when talon exhausts
  - Feature: Hand Flow and Resolution (FR-OPN-008)
  - Req IDs: FR-OPN-006, FR-OPN-008, FR-STR-006
- Scenario: rejects illegal card actions
  - Feature: Hand Flow and Resolution (FR-UIR-004)
  - Req IDs: FR-UIR-004, NFR-REL-002
- Scenario: rejects wrong-turn and unknown action types
  - Feature: Hand Flow and Resolution (NFR-REL-002)
  - Req IDs: NFR-REL-002
- Scenario: marks legal action with marriage metadata
  - Feature: Hand Flow and Resolution (FR-MRG-001)
  - Req IDs: FR-MRG-001, FR-MRG-002, FR-MRG-005
- Scenario: applies deferred marriage points when first trick is won
  - Feature: Hand Flow and Resolution (FR-MRG-006)
  - Req IDs: FR-MRG-006, FR-MRG-008
- Scenario: handles talon close failure with fixed penalty scoring path
  - Feature: Hand Flow and Resolution (FR-END-008)
  - Req IDs: FR-END-008, FR-TAL-005
- Scenario: handles talon close success path by 66
  - Feature: Hand Flow and Resolution (FR-END-008)
  - Req IDs: FR-END-008, FR-TAL-005
- Scenario: closed talon still fails when closer misses 66 despite last trick
  - Feature: Hand Flow and Resolution (FR-END-008)
  - Req IDs: FR-END-008, FR-TAL-005
- Scenario: resolves hand by final trick when no one declares 66
  - Feature: Hand Flow and Resolution (FR-END-002)
  - Req IDs: FR-END-002, FR-END-003, FR-END-004
- Scenario: promotes to match-over when target is reached
  - Feature: Hand Flow and Resolution (FR-MAT-002)
  - Req IDs: FR-MAT-002
- Scenario: accumulates game points across hands and records outcomes
  - Feature: Hand Flow and Resolution (FR-MAT-001)
  - Req IDs: FR-MAT-001
- Scenario: stores hand history summary and final match winner
  - Feature: Hand Flow and Resolution (FR-MAT-003)
  - Req IDs: FR-MAT-002, FR-MAT-003
- Scenario: wrong declare-66 loses hand with two game points penalty
  - Feature: Hand Flow and Resolution (FR-END-001)
  - Req IDs: FR-END-001, FR-END-006, FR-END-010
- Scenario: wrong declare-66 gives three points when claimant has no trick
  - Feature: Hand Flow and Resolution (FR-END-001)
  - Req IDs: FR-END-001, FR-END-007, FR-END-010
- Scenario: applies marriage points immediately when player already won a trick
  - Feature: Hand Flow and Resolution (FR-MRG-007)
  - Req IDs: FR-MRG-007
- Scenario: allows immediate declare-66 after marriage announcement when points become sufficient
  - Feature: Hand Flow and Resolution (FR-END-001)
  - Req IDs: FR-MRG-007, FR-MRG-012, FR-END-001, FR-END-009
- Scenario: accepts declare-66 via playAction when threshold is met
  - Feature: Hand Flow and Resolution (FR-END-001)
  - Req IDs: FR-END-001, FR-END-009
- Scenario: rejects declare-66 when not on lead
  - Feature: Hand Flow and Resolution (FR-END-001)
  - Req IDs: FR-END-001, FR-END-009, NFR-REL-002
- Scenario: rejects close-talon when not legal
  - Feature: Hand Flow and Resolution (FR-TAL-002)
  - Req IDs: FR-TAL-002, NFR-REL-002
- Scenario: returns no legal actions for wrong turn or non-playing phase
  - Feature: Hand Flow and Resolution (FR-END-001)
  - Req IDs: FR-END-001, NFR-REL-002
- Scenario: offers declare-66 in legal actions on lead regardless of points
  - Feature: Hand Flow and Resolution (FR-END-001)
  - Req IDs: FR-END-001, FR-END-009
- Scenario: offers explicit marriage announce action by suit
  - Feature: Hand Flow and Resolution (FR-MRG-009)
  - Req IDs: FR-MRG-001, FR-MRG-002, FR-MRG-005, FR-MRG-009, FR-MRG-011
- Scenario: allows scoring two marriages in one hand only across two leads
  - Feature: Hand Flow and Resolution (FR-MRG-013)
  - Req IDs: FR-MRG-009, FR-MRG-011, FR-MRG-013, FR-MRG-014
- Scenario: no marriage points are awarded without explicit announcement
  - Feature: Hand Flow and Resolution (FR-MRG-010)
  - Req IDs: FR-MRG-010
- Scenario: offers and executes Atout swap in 24-card mode
  - Feature: Hand Flow and Resolution (FR-TAL-006)
  - Req IDs: FR-TAL-006
- Scenario: rejects Atout swap when talon has one face-down card left
  - Feature: Hand Flow and Resolution (FR-TAL-006)
  - Req IDs: FR-TAL-006
- Scenario: allows Atout swap when 20-card leader has no won trick
  - Feature: Hand Flow and Resolution (FR-TAL-006)
  - Req IDs: FR-TAL-006
- Scenario: allows Atout swap with Unter in 20-card mode
  - Feature: Hand Flow and Resolution (FR-TAL-006)
  - Req IDs: FR-TAL-006
- Scenario: allows ordered sequence swap-close-marriage-declare66 on lead
  - Feature: Hand Flow and Resolution (FR-END-011)
  - Req IDs: FR-TAL-006, FR-TAL-001, FR-MRG-007, FR-END-001, FR-END-011
- Scenario: allows close-talon after marriage announce and keeps pending marriage intent
  - Feature: Hand Flow and Resolution (FR-TAL-008)
  - Req IDs: FR-TAL-002, FR-TAL-008, FR-MRG-009, FR-END-009
- Scenario: rejects Atout swap when talon is closed
  - Feature: Hand Flow and Resolution (FR-TAL-007)
  - Req IDs: FR-TAL-007

## schnapsen-persistence.test.js

- Scenario: saves and loads normalized settings
  - Feature: Persistence and Resume (FR-PRS-001)
  - Req IDs: FR-PRS-001
- Scenario: round-trips game state with card revival
  - Feature: Persistence and Resume (FR-PRS-001)
  - Req IDs: FR-PRS-001, FR-PRS-002
- Scenario: serializes and revives cards in current trick entries
  - Feature: Persistence and Resume (FR-PRS-001)
  - Req IDs: FR-PRS-001, FR-PRS-002
- Scenario: clears persisted state
  - Feature: Persistence and Resume (FR-PRS-001)
  - Req IDs: FR-PRS-001
- Scenario: returns null for incompatible saved versions
  - Feature: Persistence and Resume (FR-PRS-004)
  - Req IDs: FR-PRS-004
- Scenario: does not throw without storage backend
  - Feature: Persistence and Resume (NFR-REL-003)
  - Req IDs: NFR-REL-003

## schnapsen-pwa-config.test.js

- Scenario: uses schnapsen metadata
  - Feature: PWA Configuration (NFR-PWA-001)
  - Req IDs: NFR-PWA-001
- Scenario: provides install icons
  - Feature: PWA Configuration (NFR-PWA-001)
  - Req IDs: NFR-PWA-001

## schnapsen-rules.test.js

- Scenario: allows any hand card while talon is open
  - Feature: Rules Engine Behavior (FR-OPN-001)
  - Req IDs: FR-OPN-001, FR-OPN-002
- Scenario: compares Atout over non-Atout
  - Feature: Rules Engine Behavior (FR-OPN-004)
  - Req IDs: FR-OPN-004
- Scenario: covers remaining compareCards ordering branches
  - Feature: Rules Engine Behavior (FR-OPN-003)
  - Req IDs: FR-OPN-003, FR-OPN-004, FR-OPN-005
- Scenario: determines trick winner by rank in same suit
  - Feature: Rules Engine Behavior (FR-OPN-003)
  - Req IDs: FR-OPN-003, FR-OPN-005
- Scenario: applies 20-card rank order Ass > Zehn > König > Ober > Unter
  - Feature: Rules Engine Behavior (FR-CRD-005)
  - Req IDs: FR-CRD-005
- Scenario: applies 24-card rank order Ass > Zehn > König > Ober > Unter > 9
  - Feature: Rules Engine Behavior (FR-CRD-006)
  - Req IDs: FR-CRD-006
- Scenario: uses strict play after talon closes
  - Feature: Rules Engine Behavior (FR-STR-001)
  - Req IDs: FR-STR-001, FR-STR-002, FR-STR-003, FR-TAL-004
- Scenario: uses strict play after talon exhausts without close
  - Feature: Rules Engine Behavior (FR-STR-001)
  - Req IDs: FR-STR-001, FR-STR-004, FR-STR-006
- Scenario: requires Atout when follow suit is impossible in strict mode
  - Feature: Rules Engine Behavior (FR-STR-001)
  - Req IDs: FR-STR-001, FR-STR-004
- Scenario: returns marriage choices only for leader
  - Feature: Rules Engine Behavior (FR-MRG-001)
  - Req IDs: FR-MRG-001, FR-MRG-002, FR-MRG-004, FR-MRG-005
- Scenario: provides legal reason text for open and strict talon
  - Feature: Rules Engine Behavior (FR-STR-001)
  - Req IDs: FR-STR-001, FR-STR-005, FR-UIR-004

## schnapsen-scoring.test.js

- Scenario: sums trick points with schnapsen values
  - Feature: Scoring Rules (FR-CRD-003)
  - Req IDs: FR-CRD-003, FR-CRD-004
- Scenario: scores marriages as 20 or 40
  - Feature: Scoring Rules (FR-MRG-004)
  - Req IDs: FR-MRG-004, FR-MRG-005
- Scenario: computes game points for claimed-win outcomes
  - Feature: Scoring Rules (FR-END-005)
  - Req IDs: FR-END-005, FR-END-006, FR-END-007

## schnapsen-ui-shell.test.js

- Scenario: Title Bar Required Elements
  - Feature: Title Bar Structure (FR-UI-T1-001)
  - Req IDs: FR-UI-H1-001, FR-UI-T1, FR-UI-T1-001, FR-UIR-002
- Scenario: Open and Close Menu via Toggle
  - Feature: Hamburger Menu (FR-UI-H1-002)
  - Req IDs: FR-UI-H1, FR-UI-H1-002
- Scenario: Close Menu on Item Selection
  - Feature: Hamburger Menu Dismissal (FR-UI-H1-003)
  - Req IDs: FR-UI-H1-003, FR-UI-T1-002, FR-UIR-001
- Scenario: Close Menu on Escape Key
  - Feature: Hamburger Menu Dismissal (FR-UI-H1-003)
  - Req IDs: FR-UI-H1-003, FR-UI-H1-005, NFR-ACC-001
- Scenario: Close Menu on Outside Click
  - Feature: Hamburger Menu Dismissal (FR-UI-H1-003)
  - Req IDs: FR-UI-H1-003, FR-UI-H1-005
- Scenario: Options Overlay Controls Availability
  - Feature: Game Modes and Options (FR-OPT-001)
  - Req IDs: FR-OPT-001, FR-OPT-002, FR-OPT-005, FR-OPT-006, FR-OPT-008, FR-OPT-011
- Scenario: Resume Persisted Match State on App Launch
  - Feature: Persistence and Resume (FR-PRS-003)
  - Req IDs: FR-PRS-003
- Scenario: Open Talon Visual Stack
  - Feature: Talon and Atout Visual State (FR-UIR-005)
  - Req IDs: FR-UIR-005, FR-UIR-002
- Scenario: Closed Talon Visual Stack
  - Feature: Talon and Atout Visual State (FR-UIR-006)
  - Req IDs: FR-UIR-006, FR-TAL-003, FR-TAL-004
- Scenario: Exhausted Talon Visual State
  - Feature: Talon and Atout Visual State (FR-UIR-007)
  - Req IDs: FR-UIR-007, FR-STR-001
- Scenario: Enables Atout swap only when preconditions are met
  - Feature: Talon and Atout Visual State (FR-TAL-006)
  - Req IDs: FR-TAL-006, FR-TAL-007, FR-UIR-008
- Scenario: allows opening-lead Atout swap for North with Blatt 9 against open Blatt 10
  - Feature: Talon and Atout Visual State (FR-TAL-006)
  - Req IDs: FR-TAL-006, FR-UIR-008
- Scenario: indicates deferred marriage points and hides marker after conversion
  - Feature: UI and Rules Visibility (FR-UIR-003)
  - Req IDs: FR-UIR-003, FR-MRG-006, FR-MRG-007
- Scenario: Marriage requires explicit announce action in UI
  - Feature: Talon and Atout Visual State (FR-UIR-004)
  - Req IDs: FR-UIR-004, FR-MRG-009
- Scenario: hides alternate marriage announce options once one marriage is prepared
  - Feature: Talon and Atout Visual State (FR-MRG-013)
  - Req IDs: FR-MRG-009, FR-MRG-011, FR-MRG-013
- Scenario: marriage announcement indicates both cards and leads one card to trick
  - Feature: Talon and Atout Visual State (FR-MRG-003)
  - Req IDs: FR-MRG-003, FR-MRG-009, FR-MRG-011
- Scenario: allows closing talon after marriage announcement is prepared
  - Feature: Talon and Atout Visual State (FR-TAL-008)
  - Req IDs: FR-TAL-002, FR-TAL-008, FR-MRG-009, FR-END-009
- Scenario: Active seat is face-up and inactive seat is backface without position swap
  - Feature: UI and Rules Visibility (FR-UIR-009)
  - Req IDs: FR-UIR-009, FR-UIR-010, FR-UIR-013
- Scenario: Action panel controls target the currently active player
  - Feature: UI and Rules Visibility (FR-UIR-012)
  - Req IDs: FR-UIR-011, FR-UIR-012
- Scenario: hide all hand cards after hand is over
  - Feature: End-of-hand UI state (FR-UIR-015)
  - Req IDs: FR-UIR-015
- Scenario: completed trick cards remain visible for reveal delay
  - Feature: Trick Reveal Delay (FR-UIR-014)
  - Req IDs: FR-UIR-014

## Non-Automated Traceability Entries

The following requirements are currently verified through design review,
documentation conformance, static checks, manual QA, or deployment/runtime
validation rather than direct unit/integration tests in
`javascript/html5/src/test/*.test.js`.

- Traceability entry: deterministic seeded AI mode backlog
  - Verification mode: implementation backlog + design review
  - Req IDs: FR-AI-006
- Traceability entry: AI non-blocking/interrupt-safe execution
  - Verification mode: runtime/performance QA
  - Req IDs: FR-AI-007
- Traceability entry: accessibility names and roles completeness
  - Verification mode: a11y audit tooling/manual screen reader checks
  - Req IDs: NFR-ACC-002
- Traceability entry: contrast conformance for critical UI
  - Verification mode: WCAG contrast audit
  - Req IDs: NFR-ACC-003
- Traceability entry: non-color-only card/suit indication
  - Verification mode: UX accessibility review
  - Req IDs: NFR-ACC-004
- Traceability entry: browser compatibility matrix
  - Verification mode: cross-browser QA matrix
  - Req IDs: NFR-CMP-001
- Traceability entry: domain modularization by architecture layers
  - Verification mode: repository architecture review
  - Req IDs: NFR-MNT-001
- Traceability entry: deterministic dependency resolution in CI
  - Verification mode: CI pipeline/config review
  - Req IDs: NFR-MNT-002
- Traceability entry: requirement references in tests and sync docs
  - Verification mode: traceability governance review
  - Req IDs: NFR-MNT-003
- Traceability entry: startup and interaction performance budgets
  - Verification mode: profiling/benchmark runs
  - Req IDs: NFR-PERF-001, NFR-PERF-002, NFR-PERF-003
- Traceability entry: service worker precache scope completeness
  - Verification mode: PWA runtime audit + offline cache inspection
  - Req IDs: NFR-PWA-002
- Traceability entry: offline gameplay continuity after first load
  - Verification mode: offline mode manual scenario tests
  - Req IDs: NFR-PWA-003
- Traceability entry: offline startup resilience without blocking network errors
  - Verification mode: offline launch QA
  - Req IDs: NFR-PWA-004
- Traceability entry: privacy/data-minimization constraints
  - Verification mode: data-flow and storage review
  - Req IDs: NFR-SEC-001, NFR-SEC-003
- Traceability entry: unsafe dynamic code execution prohibition
  - Verification mode: static code scan/policy review
  - Req IDs: NFR-SEC-002
