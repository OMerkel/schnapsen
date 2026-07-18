import { beforeEach, describe, expect, it, vi } from "vitest";
import { CARD_BACK_ASSET } from "../config/constants.js";
import { Card } from "../core/card.js";
import { GameEngine } from "../core/game-engine.js";
import { PersistenceManager } from "../persistence/persistence-manager.js";
import { GameController } from "../ui/game-controller.js";
import { GameView } from "../ui/game-view.js";

function createStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) || null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}

function setupDom() {
  document.body.innerHTML = `
    <div id="title-bar">
      <button type="button" id="hamburger-btn" aria-expanded="false"></button>
      <h1>Schnapsen</h1>
      <div id="game-badge"></div>
    </div>
    <div id="side-panel-overlay" aria-hidden="true"></div>
    <nav id="side-panel" aria-hidden="true">
      <button type="button" id="sp-close"></button>
      <button type="button" id="sp-new-game"></button>
      <button type="button" id="sp-rules"></button>
      <button type="button" id="sp-options"></button>
      <button type="button" id="sp-about"></button>
    </nav>
    <div id="overlay-rules" class="overlay-page"><div class="overlay-content"></div></div>
    <div id="overlay-options" class="overlay-page"><div class="overlay-content"></div></div>
    <div id="overlay-about" class="overlay-page"><div class="overlay-content"></div></div>
    <div id="app"></div>
  `;
}

describe("UI shell", () => {
  beforeEach(() => {
    setupDom();
  });

  // Scenario: Title Bar Required Elements
  // Feature: Title Bar Structure (FR-UI-T1-001)
  // Req IDs: FR-UI-H1-001, FR-UI-T1, FR-UI-T1-001, FR-UIR-002
  it("renders game badge and board after init", () => {
    // Given the application is loaded
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });

    // When the title bar renders
    controller.init();

    // Then the hamburger toggle is present
    expect(document.getElementById("hamburger-btn")).not.toBeNull();
    expect(
      document.getElementById("hamburger-btn").getAttribute("aria-expanded"),
    ).toBe("false");

    // And the page title is present
    expect(document.querySelector("#title-bar h1")?.textContent).toContain(
      "Schnapsen",
    );

    // And a status/action region is present
    expect(document.getElementById("game-badge").textContent).toContain("🧑▼");
    expect(document.getElementById("app").textContent).toContain("Atout");
  });

  // Scenario: Open and Close Menu via Toggle
  // Feature: Hamburger Menu (FR-UI-H1-002)
  // Req IDs: FR-UI-H1, FR-UI-H1-002
  it("opens and closes side menu", () => {
    // Given the hamburger toggle is visible and focused
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    // When the user activates the toggle
    controller.toggleMenu();

    // Then the side bar menu becomes visible
    // And aria-expanded changes to "true"
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(true);
    expect(
      document.getElementById("hamburger-btn").getAttribute("aria-expanded"),
    ).toBe("true");

    // Given the side bar menu is open
    // When the user activates the toggle again
    controller.closeMenu();

    // Then the side bar menu closes
    // And aria-expanded changes to "false"
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(false);
    expect(
      document.getElementById("hamburger-btn").getAttribute("aria-expanded"),
    ).toBe("false");
  });

  // Scenario: Close Menu on Item Selection
  // Feature: Hamburger Menu Dismissal (FR-UI-H1-003)
  // Req IDs: FR-UI-H1-003, FR-UI-T1-002, FR-UIR-001
  it("opens rules overlay from menu", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });

    controller.init();

    // Given the side bar menu is open
    controller.toggleMenu();
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(true);

    // And a menu item "New game…" is visible
    expect(document.getElementById("sp-new-game")).not.toBeNull();

    // When the user clicks the menu item
    document.getElementById("sp-rules").click();

    // Then the side bar menu closes
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(false);

    // And the target route/view is navigated to
    expect(
      document.getElementById("overlay-rules").classList.contains("open"),
    ).toBe(true);
    expect(document.querySelector("#title-bar h1")?.textContent).toBe("Rules");
    expect(
      document.querySelector("#overlay-rules .overlay-content").textContent,
    ).toContain("Schnapsen");
  });

  // Scenario: Close Menu on Escape Key
  // Feature: Hamburger Menu Dismissal (FR-UI-H1-003)
  // Req IDs: FR-UI-H1-003, FR-UI-H1-005, NFR-ACC-001
  it("closes side menu on Escape and restores focus", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    // Given the side bar menu is open
    controller.toggleMenu();
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(true);

    // And a menu item has focus
    document.getElementById("sp-rules").focus();
    expect(document.activeElement).toBe(document.getElementById("sp-rules"));

    // When the user presses the `Esc` key
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    // Then the side bar menu closes
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(false);

    // And focus returns to the hamburger toggle
    expect(document.activeElement).toBe(
      document.getElementById("hamburger-btn"),
    );
  });

  // Scenario: Close Menu on Outside Click
  // Feature: Hamburger Menu Dismissal (FR-UI-H1-003)
  // Req IDs: FR-UI-H1-003, FR-UI-H1-005
  it("closes side menu on overlay click and restores focus", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    // Given the side bar menu is open
    controller.toggleMenu();
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(true);

    // And the side panel overlay is visible
    expect(
      document.getElementById("side-panel-overlay").classList.contains("open"),
    ).toBe(true);

    // When the user clicks outside the menu on the overlay
    document.getElementById("side-panel-overlay").click();

    // Then the side bar menu closes
    expect(
      document.getElementById("side-panel").classList.contains("open"),
    ).toBe(false);

    // And focus returns to the hamburger toggle
    expect(document.activeElement).toBe(
      document.getElementById("hamburger-btn"),
    );
  });

  // Scenario: Options Overlay Controls Availability
  // Feature: Game Modes and Options (FR-OPT-001)
  // Req IDs: FR-OPT-001, FR-OPT-002, FR-OPT-005, FR-OPT-006, FR-OPT-008, FR-OPT-011
  it("renders options controls for deck and both players", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });

    // Given the application is initialized
    controller.init();

    // When the user opens the options overlay
    document.getElementById("sp-options").click();

    // Then the options view is visible
    expect(
      document.getElementById("overlay-options").classList.contains("open"),
    ).toBe(true);

    // And the deck variant control exists
    expect(document.querySelector("select[name='deckVariant']")).not.toBeNull();

    // And both player type controls exist
    expect(
      document.querySelector("select[name='playerType-0']"),
    ).not.toBeNull();
    expect(
      document.querySelector("select[name='playerType-1']"),
    ).not.toBeNull();

    // And AI level is disabled for a human player slot
    expect(
      document
        .querySelector("select[name='playerLevel-0']")
        ?.hasAttribute("disabled"),
    ).toBe(true);

    expect(document.getElementById("overlay-options")?.textContent).toContain(
      "🧑▼",
    );
    expect(document.getElementById("overlay-options")?.textContent).toContain(
      "🧑▲",
    );
  });

  // Scenario: Resume Persisted Match State on App Launch
  // Feature: Persistence and Resume (FR-PRS-003)
  // Req IDs: FR-PRS-003
  it("resumes persisted match state on init", () => {
    // Given a previously persisted match state
    const storage = createStorage();
    const seedEngine = new GameEngine();
    const seedState = seedEngine.startMatch(28);
    const persistence = new PersistenceManager(storage);
    persistence.saveState(seedState);

    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence,
      documentRef: document,
      windowRef: window,
    });

    // When the app initializes with persisted state available
    controller.init();

    // Then the saved game is resumed in the rendered UI
    expect(document.getElementById("app").textContent).toContain(
      "Gespeicherter Spielstand wurde fortgesetzt",
    );
  });

  // Scenario: Open Talon Visual Stack
  // Feature: Talon and Atout Visual State (FR-UIR-005)
  // Req IDs: FR-UIR-005, FR-UIR-002
  it("renders open talon with partial Atout overlap", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const stack = document.querySelector(".atout-stack");
    expect(stack).not.toBeNull();
    expect(stack?.classList.contains("atout-stack-open")).toBe(true);
    expect(document.querySelector(".talon-indicator")).not.toBeNull();
    expect(
      document.querySelector(".atout-suit-row .atout-suit-image"),
    ).not.toBeNull();
    expect(document.getElementById("app").textContent).not.toContain("Status:");
  });

  // Scenario: Closed Talon Visual Stack
  // Feature: Talon and Atout Visual State (FR-UIR-006)
  // Req IDs: FR-UIR-006, FR-TAL-003, FR-TAL-004
  it("renders closed talon with Atout backface above talon", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.talonClosed = true;
    state.talonClosedBy = 0;
    controller.render();

    const stack = document.querySelector(".atout-stack");
    expect(stack).not.toBeNull();
    expect(stack?.classList.contains("atout-stack-closed")).toBe(true);
    const atoutImage = document.querySelector(".atout-stack .atout-card-image");
    expect(atoutImage?.getAttribute("src")).toBe(CARD_BACK_ASSET);
    expect(document.querySelector(".talon-indicator")).not.toBeNull();
  });

  // Scenario: Exhausted Talon Visual State
  // Feature: Talon and Atout Visual State (FR-UIR-007)
  // Req IDs: FR-UIR-007, FR-STR-001
  it("hides talon stack but keeps Atout suit visible when talon is exhausted", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.talon = [];
    controller.render();

    expect(document.querySelector(".atout-stack")).toBeNull();
    expect(document.querySelector(".talon-indicator")).toBeNull();
    expect(document.querySelector(".atout-suit-row")).not.toBeNull();
    expect(
      document.querySelector(".atout-suit-row .atout-suit-image"),
    ).not.toBeNull();
  });

  // Scenario: Enables Atout swap only when preconditions are met
  // Feature: Talon and Atout Visual State (FR-TAL-006)
  // Req IDs: FR-TAL-006, FR-TAL-007, FR-UIR-008
  it("enables Atout swap button only for legal swap state", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.currentPlayerIndex = 0;
    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("eichel", "ass"),
      new Card("blatt", "unter"),
      new Card("herz", "könig"),
    ];
    state.atoutSuit = "herz";
    state.atoutCard = state.talon.at(-1);
    state.players[0].wonTrickCount = 1;
    state.players[0].hand = [new Card("herz", "9"), new Card("blatt", "ass")];
    controller.render();

    const swapButton = document.querySelector(
      "button[data-action='swap-atout']",
    );
    expect(swapButton).not.toBeNull();

    state.talonClosed = true;
    controller.render();
    const disabledSwapButton = document.querySelector(
      "button[data-action='swap-atout']",
    );
    expect(disabledSwapButton).toBeNull();

    state.talonClosed = false;
    state.deckVariant = "20-card";
    state.players[0].wonTrickCount = 0;
    state.players[0].hand = [
      new Card("herz", "unter"),
      new Card("blatt", "ass"),
    ];
    controller.render();
    expect(
      document.querySelector("button[data-action='swap-atout']"),
    ).not.toBeNull();

    state.players[0].wonTrickCount = 1;
    state.talon = [new Card("herz", "könig"), new Card("herz", "unter")];
    state.atoutCard = state.talon.at(-1);
    controller.render();
    expect(
      document.querySelector("button[data-action='swap-atout']"),
    ).toBeNull();
  });

  // Scenario: allows opening-lead Atout swap for North with Blatt 9 against open Blatt 10
  // Feature: Talon and Atout Visual State (FR-TAL-006)
  // Req IDs: FR-TAL-006, FR-UIR-008
  it("shows swap action for North on opening lead with lowest Atout in hand", () => {
    const controller = new GameController({
      engine: new GameEngine({ deckVariant: "24-card" }),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.deckVariant = "24-card";
    state.currentPlayerIndex = 1;
    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("herz", "ass"),
      new Card("eichel", "ober"),
      new Card("blatt", "10"),
    ];
    state.atoutSuit = "blatt";
    state.atoutCard = state.talon.at(-1);
    state.players[1].wonTrickCount = 0;
    state.players[1].hand = [new Card("blatt", "9"), new Card("herz", "10")];

    controller.render();

    expect(
      document.querySelector("button[data-action='swap-atout']"),
    ).not.toBeNull();
  });

  // Scenario: indicates deferred marriage points and hides marker after conversion
  // Feature: UI and Rules Visibility (FR-UIR-003)
  // Req IDs: FR-UIR-003, FR-MRG-006, FR-MRG-007
  it("shows deferred marriage points and clears indicator after conversion", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.players[0].deferredMarriagePoints = 40;
    state.players[0].appliedMarriagePoints = 0;
    controller.render();

    expect(document.getElementById("app").textContent).toContain(
      "Marriage vorgemerkt: 40",
    );

    state.players[0].deferredMarriagePoints = 0;
    state.players[0].appliedMarriagePoints = 40;
    controller.render();

    expect(document.getElementById("app").textContent).not.toContain(
      "Marriage vorgemerkt: 40",
    );
  });

  // Scenario: Marriage requires explicit announce action in UI
  // Feature: Talon and Atout Visual State (FR-UIR-004)
  // Req IDs: FR-UIR-004, FR-MRG-009
  it("renders explicit marriage announcement action", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.currentPlayerIndex = 0;
    state.currentTrick.cards = [];
    state.players[0].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
      new Card("blatt", "ass"),
    ];
    controller.render();

    const announceButton = document.querySelector(
      "button[data-action='announce-marriage'][data-suit='herz']",
    );
    expect(announceButton).not.toBeNull();
  });

  // Scenario: only one marriage announcement can be made per lead
  // Feature: Talon and Atout Visual State (FR-MRG-013)
  // Req IDs: FR-MRG-009, FR-MRG-011, FR-MRG-013
  it("hides alternate marriage announce options once one marriage is prepared", () => {
    const controller = new GameController({
      engine: new GameEngine({ deckVariant: "24-card" }),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.currentPlayerIndex = 0;
    state.currentTrick.cards = [];
    state.players[0].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
      new Card("eichel", "könig"),
      new Card("eichel", "ober"),
    ];
    controller.render();

    const beforeButtons = document.querySelectorAll(
      "button[data-action='announce-marriage']",
    );
    expect(beforeButtons.length).toBe(2);

    document
      .querySelector(
        "button[data-action='announce-marriage'][data-suit='herz']",
      )
      ?.click();

    const afterButtons = document.querySelectorAll(
      "button[data-action='announce-marriage']",
    );
    expect(afterButtons.length).toBe(0);
    expect(document.getElementById("app").textContent).toContain(
      "Marriage vorbereitet: Herz (König + Ober)",
    );
  });

  // Scenario: marriage announcement indicates both cards and leads one card to trick
  // Feature: Talon and Atout Visual State (FR-MRG-003)
  // Req IDs: FR-MRG-003, FR-MRG-009, FR-MRG-011
  it("shows marriage indicator and then plays exactly one card to trick", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.currentPlayerIndex = 0;
    state.currentTrick.cards = [];
    state.players[0].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
      new Card("blatt", "ass"),
    ];
    state.players[1].hand = [new Card("blatt", "unter")];
    controller.render();

    document
      .querySelector(
        "button[data-action='announce-marriage'][data-suit='herz']",
      )
      ?.click();

    expect(document.getElementById("app").textContent).toContain(
      "Marriage vorbereitet: Herz (König + Ober)",
    );

    document
      .querySelector("button[data-player-index='0'][data-card-id='herz:könig']")
      ?.click();

    expect(
      document.querySelectorAll(".current-trick-cards .trick-card"),
    ).toHaveLength(1);
  });

  // Scenario: close talon click works after marriage announcement is pending
  // Feature: Talon and Atout Visual State (FR-TAL-002)
  // Req IDs: FR-TAL-002, FR-MRG-009, FR-END-009
  it("allows closing talon after marriage announcement is prepared", () => {
    const controller = new GameController({
      engine: new GameEngine({ deckVariant: "24-card" }),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.currentPlayerIndex = 0;
    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("blatt", "ass"),
      new Card("herz", "unter"),
      new Card("eichel", "ober"),
    ];
    state.atoutSuit = "eichel";
    state.atoutCard = state.talon.at(-1);
    state.players[0].wonTrickCount = 1;
    state.players[0].trickPoints = 27;
    state.players[0].hand = [
      new Card("eichel", "könig"),
      new Card("eichel", "9"),
      new Card("schellen", "ass"),
    ];
    controller.render();

    document.querySelector("button[data-action='swap-atout']")?.click();
    document
      .querySelector(
        "button[data-action='announce-marriage'][data-suit='eichel']",
      )
      ?.click();

    expect(document.getElementById("app").textContent).toContain(
      "Marriage vorbereitet: Eichel (König + Ober)",
    );

    document.querySelector("button[data-action='close-talon']")?.click();
    expect(controller.engine.getState().talonClosed).toBe(true);
    expect(controller.engine.getState().pendingMarriageIntent?.suit).toBe(
      "eichel",
    );
  });

  // Scenario: Active seat is face-up and inactive seat is backface without position swap
  // Feature: UI and Rules Visibility (FR-UIR-009)
  // Req IDs: FR-UIR-009, FR-UIR-010, FR-UIR-013
  it("shows only active seat hand face-up while keeping north/south positions fixed", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.currentPlayerIndex = 1;
    state.phase = "playing";
    state.players[0].hand = [new Card("blatt", "ass")];
    state.players[1].hand = [new Card("herz", "könig")];
    controller.render();

    expect(
      document.querySelector(".player-north-hand button[data-card-id]"),
    ).not.toBeNull();
    expect(
      document.querySelector(".player-south-hand button[data-card-id]"),
    ).toBeNull();
    expect(
      document.querySelector(".player-south-hand .hand-back-display"),
    ).not.toBeNull();
  });

  // Scenario: Action panel controls target the currently active player
  // Feature: UI and Rules Visibility (FR-UIR-012)
  // Req IDs: FR-UIR-011, FR-UIR-012
  it("dispatches close-talon for the active player", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.currentPlayerIndex = 1;
    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [new Card("eichel", "ass")];
    controller.render();

    document.querySelector("button[data-action='close-talon']")?.click();
    expect(controller.engine.getState().talonClosedBy).toBe(1);
  });

  // Scenario: hide all hand cards after hand is over
  // Feature: End-of-hand UI state (FR-UIR-015)
  // Req IDs: FR-UIR-015
  it("shows no cards in either hand panel when hand is over", () => {
    const controller = new GameController({
      engine: new GameEngine(),
      view: new GameView(document.getElementById("app")),
      persistence: new PersistenceManager(createStorage()),
      documentRef: document,
      windowRef: window,
    });
    controller.init();

    const state = controller.engine.getState();
    state.phase = "hand-over";
    state.players[0].hand = [new Card("blatt", "ass")];
    state.players[1].hand = [new Card("herz", "könig")];
    controller.render();

    expect(
      document.querySelector(".player-south-hand .card-element"),
    ).toBeNull();
    expect(
      document.querySelector(".player-north-hand .card-element"),
    ).toBeNull();
  });

  // Scenario: completed trick cards remain visible for reveal delay
  // Feature: Trick Reveal Delay (FR-UIR-014)
  // Req IDs: FR-UIR-014
  it("keeps both trick cards visible for 4 seconds before continuing", () => {
    vi.useFakeTimers();
    try {
      const controller = new GameController({
        engine: new GameEngine(),
        view: new GameView(document.getElementById("app")),
        persistence: new PersistenceManager(createStorage()),
        documentRef: document,
        windowRef: window,
      });
      controller.init();

      const state = controller.engine.getState();
      const leader = state.currentPlayerIndex;
      const follower = 1 - leader;

      state.players[leader].hand = [new Card("herz", "ass")];
      state.players[follower].hand = [new Card("blatt", "unter")];
      state.currentTrick.cards = [];
      state.talon = [];
      controller.render();

      document
        .querySelector(
          `button[data-player-index='${leader}'][data-card-id='herz:ass']`,
        )
        ?.click();
      document
        .querySelector(
          `button[data-player-index='${follower}'][data-card-id='blatt:unter']`,
        )
        ?.click();

      expect(
        document.querySelectorAll(".current-trick-cards .trick-card"),
      ).toHaveLength(2);

      vi.advanceTimersByTime(3999);
      expect(
        document.querySelectorAll(".current-trick-cards .trick-card"),
      ).toHaveLength(2);

      vi.advanceTimersByTime(1);
      expect(
        document.querySelectorAll(".current-trick-cards .trick-card"),
      ).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  // Scenario: talon draw happens only after reveal delay finishes
  // Feature: Trick Reveal Delay (FR-UIR-014)
  // Req IDs: FR-UIR-014, FR-OPN-008
  it("keeps hands reduced during reveal and restocks only after timeout", () => {
    vi.useFakeTimers();
    try {
      const controller = new GameController({
        engine: new GameEngine(),
        view: new GameView(document.getElementById("app")),
        persistence: new PersistenceManager(createStorage()),
        documentRef: document,
        windowRef: window,
      });
      controller.init();

      const state = controller.engine.getState();
      const leader = state.currentPlayerIndex;
      const follower = 1 - leader;

      state.players[leader].hand = [new Card("herz", "ass")];
      state.players[follower].hand = [new Card("blatt", "unter")];
      state.currentTrick.cards = [];
      state.talonClosed = false;
      state.talon = [
        new Card("eichel", "10"),
        new Card("schellen", "ober"),
        new Card("blatt", "könig"),
      ];
      state.atoutSuit = "blatt";
      state.atoutCard = state.talon.at(-1);
      controller.render();

      document
        .querySelector(
          `button[data-player-index='${leader}'][data-card-id='herz:ass']`,
        )
        ?.click();
      document
        .querySelector(
          `button[data-player-index='${follower}'][data-card-id='blatt:unter']`,
        )
        ?.click();

      expect(state.pendingTrickDraw).not.toBeNull();
      expect(state.players[leader].hand).toHaveLength(0);
      expect(state.players[follower].hand).toHaveLength(0);
      expect(state.talon).toHaveLength(3);

      vi.advanceTimersByTime(3999);
      expect(state.pendingTrickDraw).not.toBeNull();
      expect(state.players[leader].hand).toHaveLength(0);
      expect(state.players[follower].hand).toHaveLength(0);
      expect(state.talon).toHaveLength(3);

      vi.advanceTimersByTime(1);
      expect(state.pendingTrickDraw).toBeNull();
      expect(state.players[leader].hand).toHaveLength(1);
      expect(state.players[follower].hand).toHaveLength(1);
      expect(state.talon).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
