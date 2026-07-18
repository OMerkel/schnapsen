# Gherkin Scenario and Feature Descriptions

This file formulates unit-testable requirements in Gherkin syntax, organized by
test module.

Format:

```text
Scenario: [Short description]
Feature: [Feature being tested]

Given [Prerequisites]
When [Event/trigger]
Then [Expected outcome]
```

Multiple Given/When/Then statements may exist per Feature/Scenario.

---

## test-card.test.js

### Scenario: Create an Individual Card

Feature: Card Representation (FR-CRD-003, FR-CRD-007)

Given a card with suit "Eichel", rank "Ass", and value 11
When the card is created
Then the card should have suit "Eichel", rank "Ass", and value 11

### Scenario: Card Immutability

Feature: Immutable Card Implementation (FR-CRD-007)

Given a card instance
When attempting to modify the card's value
Then the operation should fail (freeze prevents modification)

### Scenario: Card Equality Comparison

Feature: Card Equality (FR-CRD-003)

Given two cards with identical suit and rank ("Eichel", "Ass")
When comparing them for equality
Then the comparison should return true

Given two cards with different suits ("Eichel", "Ass") vs ("Herz", "Ass")
When comparing them for equality
Then the comparison should return false

---

## test-ui-menu.test.js

### Scenario: Hamburger Menu Toggle Visibility

Feature: Hamburger Menu (FR-UI-H1-001)

Given the application is loaded on a primary screen
When the page renders
Then the hamburger toggle control is visible in the title bar
And the control is keyboard-focusable
And the control has accessible name "Open navigation menu"
And the control has aria-expanded="false"

### Scenario: Open and Close Menu via Toggle

Feature: Hamburger Menu (FR-UI-H1-002)

Given the hamburger toggle is visible and focused
When the user activates the toggle
Then the side bar menu becomes visible
And aria-expanded changes to "true"
And animation completes within 300 ms

Given the side bar menu is open
When the user activates the toggle again
Then the side bar menu closes
And aria-expanded changes to "false"

### Scenario: Close Menu on Item Selection

Feature: Hamburger Menu Dismissal (FR-UI-H1-003)

Given the side bar menu is open
And a menu item "New game…" is visible
When the user clicks the menu item
Then the side bar menu closes
And the target route/view is navigated to

### Scenario: Close Menu on Escape Key

Feature: Hamburger Menu Dismissal (FR-UI-H1-003)

Given the side bar menu is open
And a menu item has focus
When the user presses the `Esc` key
Then the side bar menu closes
And focus returns to the hamburger toggle

Test mapping: `schnapsen-ui-shell.test.js` - `closes side menu on Escape and restores focus`

### Scenario: Close Menu on Outside Click

Feature: Hamburger Menu Dismissal (FR-UI-H1-003)

Given the side bar menu is open
And the side panel overlay is visible
When the user clicks outside the menu on the overlay
Then the side bar menu closes
And focus returns to the hamburger toggle

Test mapping: `schnapsen-ui-shell.test.js` - `closes side menu on overlay click and restores focus`

### Scenario: Menu Item Semantics and Active Indication

Feature: Hamburger Menu Navigation (FR-UI-H1-004)

Given the side bar menu is open
And menu items map to routes (New game, Rules, Options, About)
When the user navigates to the Rules route
Then the "Rules" menu item is visually highlighted as active
And the active-item state persists after menu closes

### Scenario: Focus Management on Menu Open

Feature: Hamburger Menu Accessibility (FR-UI-H1-005)

Given the hamburger toggle is focused
When the user activates the toggle to open the menu
Then focus moves to the first actionable element in the menu
And screen reader announces "Application menu" region

### Scenario: Focus Return on Menu Close

Feature: Hamburger Menu Accessibility (FR-UI-H1-005)

Given the side bar menu is open with focus inside
When the user closes the menu (via Esc, item selection, or outside click)
Then focus returns to the hamburger toggle

### Scenario: Options Overlay Controls Availability

Feature: Game Modes and Options (FR-OPT-001)

Given the application is initialized
When the user opens the options overlay
Then the options view is visible
And the deck variant control exists
And both player type controls exist
And AI level is disabled for a human player slot

Test mapping: `schnapsen-ui-shell.test.js` - `renders options controls for deck and both players`

### Scenario: Resume Persisted Match State on App Launch

Feature: Persistence and Resume (FR-PRS-003)

Given a previously persisted match state
When the app initializes with persisted state available
Then the saved game is resumed in the rendered UI

Test mapping: `schnapsen-ui-shell.test.js` - `resumes persisted match state on init`

### Scenario: Open Talon Visual Stack

Feature: Talon and Atout Visual State (FR-UIR-005)

Given a hand in open talon state
When the board is rendered
Then the talon is shown as a face-down pile
And the talon partly covers the open Atout card
And the Atout suit symbol remains visible

Test mapping: `schnapsen-ui-shell.test.js` - `renders open talon with partial Atout overlap`

### Scenario: Closed Talon Visual Stack

Feature: Talon and Atout Visual State (FR-UIR-006)

Given a hand in closed talon state
When the board is rendered
Then the Atout is shown as face-down card
And the Atout layer appears above the talon layer

Test mapping: `schnapsen-ui-shell.test.js` - `renders closed talon with Atout backface above talon`

### Scenario: Exhausted Talon Visual State

Feature: Talon and Atout Visual State (FR-UIR-007)

Given a hand with exhausted talon
When the board is rendered
Then talon and Atout card stack are hidden
And the Atout suit symbol remains visible
And only hand cards remain as playable card source

Test mapping: `schnapsen-ui-shell.test.js` - `hides talon and Atout visuals when talon is exhausted`

### Scenario: Final Open Talon Draw Distribution

Feature: Open Talon Draw Order and Exhaustion (FR-OPN-008, FR-STR-006)

Given the talon has exactly one face-down card plus the open Atout card
And a trick is completed while talon remains open
When post-trick draw is resolved
Then the trick winner receives the final face-down talon card
And the trick loser receives the open Atout card
And talon cards on table are exhausted afterward
And strict play applies from the next trick onward

Test mapping: `schnapsen-deck-and-dealing.test.js` - `hands out final talon card then open Atout on last open draw`
Test mapping: `schnapsen-engine.test.js` - `gives winner the final facedown talon card and loser the open Atout`
Test mapping: `schnapsen-rules.test.js` - `uses strict play after talon exhausts without close`

### Scenario: Swap Open Atout with Lowest Atout Card

Feature: Talon Swap Action (FR-TAL-006)

Given the talon is open
And the active leader holds the lowest Atout card for the deck variant
And more than two cards remain in talon
When the player performs the Atout swap action
Then the open Atout card is moved to the player's hand
And the previously held lowest Atout card becomes the new open Atout card

Test mapping: `schnapsen-engine.test.js` - `offers and executes Atout swap in 24-card mode`
Test mapping: `schnapsen-engine.test.js` - `allows Atout swap with Unter in 20-card mode`

### Scenario: No Atout Swap after Talon Close

Feature: Talon Swap Action (FR-TAL-007)

Given the talon is closed
When the active player attempts the Atout swap action
Then the action is rejected as illegal

Test mapping: `schnapsen-engine.test.js` - `rejects Atout swap when talon is closed`
Test mapping: `schnapsen-rules.test.js` - `returns no swap card when talon is closed`
Test mapping: `schnapsen-ui-shell.test.js` - `enables Atout swap button only for legal swap state`

### Scenario: Explicit Marriage Announcement Required

Feature: Marriage Scoring (FR-MRG-009, FR-MRG-011)

Given the active leader holds König and Ober of the same suit
When the player selects announce-marriage for that suit
Then the action is accepted without playing a trick card yet
And the next legal lead is restricted to König or Ober of the announced suit
And marriage points are applied immediately only if the announcer already has at least one won trick
And otherwise marriage points are deferred until the announcer wins the first trick

Test mapping: `schnapsen-engine.test.js` - `offers explicit marriage announce action by suit`
Test mapping: `schnapsen-ai.test.js` - `medium AI explicitly announces marriage when available`
Test mapping: `schnapsen-ai.test.js` - `plays matching König or Ober after announcing marriage`

### Scenario: Immediate Declare-66 after Marriage Announcement

Feature: Marriage Scoring (FR-MRG-007, FR-MRG-012)

Given the active leader already has at least one won trick
And announce-marriage is accepted on lead
When immediate marriage points raise the leader to 66 or more
Then declare-66 is legal immediately after announce-marriage
And the hand may end without leading a marriage card

Test mapping: `schnapsen-engine.test.js` - `allows declare-66 right after marriage announcement when points become sufficient`

### Scenario: Two Marriages Require Separate Leads

Feature: Marriage Scoring (FR-MRG-013, FR-MRG-014)

Given the active leader holds two marriageable suits
When the leader announces one marriage on the current lead
Then no second announce-marriage action is accepted for that same lead
And the leader must finish that trick with the announced King/Ober
When the leader wins the trick and leads again
Then a second marriage announcement for the other suit becomes legal

Test mapping: `schnapsen-engine.test.js` - `allows scoring two marriages in one hand only across two leads`
Test mapping: `schnapsen-ui-shell.test.js` - `hides alternate marriage announce options once one marriage is prepared`

### Scenario: Ordered Pre-Lead Workflow swap-close-marriage-declare

Feature: Pre-Lead Action Ordering Edge Case (FR-END-011)

Given the active leader is on lead with open talon
And the leader can legally swap Atout
And the leader can legally close talon
And an Atout marriage is available with immediate marriage scoring
When the leader performs actions in order `swap-atout`, `close-talon`, `announce-marriage`, `declare-66`
Then each action is accepted in that order
And the hand ends immediately on `declare-66`

Test mapping: `schnapsen-engine.test.js` - `allows ordered sequence swap-close-marriage-declare66 on lead`

### Scenario: Close Talon after Marriage Announcement Preparation

Feature: Pre-Lead Action Ordering Edge Case (FR-TAL-008)

Given the active leader is on lead with open talon
And the leader performs `announce-marriage`
And no lead card has been played yet
When the leader performs `close-talon`
Then `close-talon` is accepted
And pending marriage intent remains active
And the next legal actions include either `declare-66` or leading the announced King/Ober

Test mapping: `schnapsen-engine.test.js` - `allows close-talon after marriage announce and keeps pending marriage intent`
Test mapping: `schnapsen-ui-shell.test.js` - `allows closing talon after marriage announcement is prepared`

### Scenario: Missed Marriage Announcement Gives No Points

Feature: Marriage Scoring (FR-MRG-010)

Given the active leader holds a valid marriage pair
When the player leads König or Ober without announce-marriage action
Then no marriage points are awarded for that trick

Test mapping: `schnapsen-engine.test.js` - `does not score marriage if player skips announcement`

### Scenario: 66 Declaration Is a Lead Action

Feature: Hand Flow and Resolution (FR-END-001, FR-END-009)

Given the current player is active leader and no card was played in the current trick
When the player chooses the declare-66 action
Then the declaration is accepted as a legal hand-ending claim attempt

Given the current player is not on lead
When the player attempts declare-66
Then the action is rejected as illegal

Test mapping: `schnapsen-engine.test.js` - `offers declare-66 in legal actions on lead regardless of points`
Test mapping: `schnapsen-engine.test.js` - `rejects declare-66 when not on lead`
Test mapping: `schnapsen-ai.test.js` - `does not declare 66 when not on lead`

### Scenario: Wrong 66 Declaration Penalty

Feature: Hand Flow and Resolution (FR-END-006, FR-END-007, FR-END-010)

Given the active leader declares 66 with fewer than 66 points
When the declaration is resolved
Then the declarer loses the hand immediately
And opponent receives 2 game points as standard

Given the active leader has won no trick and declares 66 with fewer than 66 points
When the declaration is resolved
Then opponent receives 3 game points

Test mapping: `schnapsen-engine.test.js` - `penalizes wrong declare-66 with two game points`
Test mapping: `schnapsen-engine.test.js` - `penalizes wrong declare-66 with three game points when Schwarz`

### Scenario: Closed Talon Failure and Last-Trick Success

Feature: Hand Flow and Resolution (FR-END-008, FR-TAL-005)

Given a player has closed talon
When hand resolution ends without closer reaching 66 and without closer winning last trick
Then closer loses and opponent receives penalty game points per failed-claim rule (2 or 3)

Given a player has closed talon
When all remaining cards are played without a correct 66 declaration by closer
Then closer loses the hand

Test mapping: `schnapsen-engine.test.js` - `handles talon close failure scoring path`
Test mapping: `schnapsen-engine.test.js` - `handles talon close success path by last trick win`

### Scenario: No Claim Path Uses Last Trick for One Point

Feature: Hand Flow and Resolution (FR-END-002, FR-END-003, FR-END-004)

Given neither player declares 66 before all cards are played
When the final trick is resolved
Then the final trick winner wins the hand
And the final trick winner receives exactly 1 game point
And card-point totals do not increase hand scoring beyond that one point in this no-claim path

Test mapping: `schnapsen-engine.test.js` - `finishes by final trick path with fixed one-point last-trick win`

### Scenario: Fixed South and North Seat Layout with Active Visibility

Feature: UI and Rules Visibility (FR-UIR-009, FR-UIR-010, FR-UIR-013)

Given Player South is the south seat and Player North is the north seat
When turn ownership changes between seats
Then seat positions stay fixed on board
And only the active seat hand is shown face-up
And the inactive seat hand is shown by backfaces
And seat labels display Player/AI plus South or North

Test mapping: `schnapsen-ui-shell.test.js` - `shows only active seat hand face-up while keeping north/south positions fixed`
Test mapping: `schnapsen-ui-shell.test.js` - `renders options controls for deck and both players`

### Scenario: Action Panel Targets Active Player

Feature: UI and Rules Visibility (FR-UIR-011, FR-UIR-012)

Given a seat is currently active
When the user triggers an action button
Then the action is dispatched for the active player index
And inactive player state is not directly mutated by that control

Test mapping: `schnapsen-ui-shell.test.js` - `dispatches close-talon for the active player`

### Scenario: Responsive Menu Behavior on Mobile

Feature: Hamburger Menu Responsiveness (FR-UI-H1-006)

Given the viewport width is 480px (mobile)
When the menu is opened
Then the menu appears as an overlay drawer over content
And content is not pushed right

### Scenario: Responsive Menu Behavior on Desktop

Feature: Hamburger Menu Responsiveness (FR-UI-H1-006)

Given the viewport width is 1024px (desktop)
When the menu is opened
Then the menu may appear as overlay or push mode per configuration

---

## test-ui-title-bar.test.js

### Scenario: Title Bar Required Elements

Feature: Title Bar Structure (FR-UI-T1-001)

Given the application is loaded
When the title bar renders
Then the hamburger toggle is present
And the page title is present
And a status/action region is present

### Scenario: Title Text Reflects Route Context

Feature: Dynamic Title (FR-UI-T1-002)

Given the user is on the main menu route
When the title bar renders
Then the title text displays "Schnapsen"

Given the user navigates to the Rules route
When the title updates
Then the title text displays "Rules" (or equivalent)
And the update occurs without full page reload
And update completes within 150 ms

### Scenario: Title Bar Remains Sticky During Scroll

Feature: Title Bar Sticky Behavior (FR-UI-T1-003)

Given the title bar is rendered on a page with scrollable content
When the user scrolls down the content area
Then the title bar remains visible at the top
And content below the title bar does not overlap the bar

### Scenario: Action Priority Collapse on Small Screens

Feature: Title Bar Action Priority (FR-UI-T1-004)

Given the viewport width is 480px
And the title bar has primary and secondary actions
When the title bar renders
Then secondary actions collapse into an overflow menu
And critical actions remain directly visible

Given the viewport width is 1024px
When the title bar renders
Then all actions are visible without collapse

### Scenario: Title Bar Control Keyboard Operability

Feature: Title Bar Accessibility (FR-UI-T1-005)

Given the title bar has interactive controls
When a control has focus
Then the control is keyboard-operable (activable via Enter or Space)
And the control meets minimum target size of 44×44 CSS px

---

## test-ui-badge.test.js

### Scenario: Render Numeric Badge

Feature: Badge Types (FR-UI-B1-001)

Given a numeric badge component is created with count=5
When the badge renders
Then the badge displays "5"
And the badge is visible and properly positioned

### Scenario: Render Dot Badge

Feature: Badge Types (FR-UI-B1-001)

Given a dot badge component is created
When the badge renders
Then the badge displays as a small dot indicator
And the badge is positioned consistently

### Scenario: Render Status Badge

Feature: Badge Types (FR-UI-B1-001)

Given a status badge component is created with label="New"
When the badge renders
Then the badge displays "New"
And the badge uses appropriate semantic styling

### Scenario: Numeric Badge Count Formatting - Zero

Feature: Badge Count Formatting (FR-UI-B1-002)

Given a numeric badge is bound to a count of 0
When the badge renders
Then the badge is hidden by default
(Or configurable to show "0" if explicitly set)

### Scenario: Numeric Badge Count Formatting - Overflow

Feature: Badge Count Formatting (FR-UI-B1-002)

Given a numeric badge is bound to a count of 120
And the badge max threshold is 99
When the badge renders
Then the badge displays "99+"
And the compact form is maintained

### Scenario: Numeric Badge Count Formatting - Normal Range

Feature: Badge Count Formatting (FR-UI-B1-002)

Given a numeric badge is bound to a count of 3
When the badge renders
Then the badge displays "3"

### Scenario: Badge Reactive Update on State Change

Feature: Badge Reactivity (FR-UI-B1-003)

Given a numeric badge is bound to a game state property (e.g., pending notifications)
And the current count is 2
When the backing state count increases to 5
Then the badge updates to display "5" within 200 ms
And no manual refresh is required

### Scenario: Badge Updates After Offline/Online Transition

Feature: Badge Reliability (NFR-UI-REL-001)

Given a badge is rendered
And the app transitions from offline to online state
When new state data arrives
Then the badge updates correctly without losing bindings

### Scenario: Badge Uses Semantic Color Tokens

Feature: Badge Color Semantics (FR-UI-B1-004)

Given a badge is marked with semantic type "error"
When the badge renders
Then the badge applies error color token (e.g., red)
And the color meets WCAG 2.2 AA contrast ratio with background

Given a badge is marked with semantic type "success"
When the badge renders
Then the badge applies success color token (e.g., green)

### Scenario: Badge Positioning Consistency

Feature: Badge Positioning (FR-UI-B1-005)

Given a badge is attached to a menu icon
And the viewport width is 480px (mobile)
When the badge renders
Then the badge anchor position is consistent (e.g., top-right)
And the badge does not clip or shift

Given the viewport width is 1024px (desktop)
And zoom level is 200%
When the badge renders
Then the badge positioning remains consistent and non-clipping

### Scenario: Badge Announces Count Change to Screen Reader

Feature: Badge Live Region Announcements (FR-UI-B1-006)

Given a badge has aria-live="polite" and aria-label="Game notifications"
And the initial count is 0 (hidden)
When the count changes to 3
Then the screen reader announces "Game notifications 3"
And the announcement uses polite politeness (does not interrupt)

Given the count is 50 and displays as "50"
When the count increases to 120 and displays as "99+"
Then the screen reader announces "Game notifications 99 plus" (or equivalent)

---

## Canonical Synchronization Source

The authoritative, test-derived synchronization list for current scenarios and
Req IDs is maintained in [doc/gherkin-sync-section.md](gherkin-sync-section.md).

Use that file as the canonical bridge between:

- test scenario comments in `javascript/html5/src/test/*.test.js`
- requirement IDs in [doc/requirements.md](requirements.md)
- scenario/feature wording in this document
