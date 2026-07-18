import { getAIMove } from "../ai/ai-manager.js";
import { getDefaultSettings, mergeSettings } from "../config/configuration.js";
import { TRICK_REVEAL_DELAY_MS } from "../config/constants.js";
import { STATUS_MESSAGES } from "../config/messages.js";
import { getPlayerDisplayTag, getSeatSymbolForIndex } from "./player-labels.js";

export class GameController {
  constructor({
    engine,
    view,
    persistence,
    documentRef = document,
    windowRef = window,
  }) {
    this.engine = engine;
    this.view = view;
    this.persistence = persistence;
    this.document = documentRef;
    this.window = windowRef;
    this.aiTimer = null;
    this.trickRevealTimer = null;
    this.trickRevealCards = null;
  }

  init() {
    const storedSettings = this.persistence.loadSettings();
    if (storedSettings) {
      this.engine.setSettings(storedSettings);
    }

    const savedState = this.persistence.loadState();
    if (savedState) {
      this.engine.resume(savedState);
      this.engine.getState().statusMessage = STATUS_MESSAGES.resumed;
    } else {
      this.engine.startMatch();
    }

    this.bindShell();
    this.render();
    this.maybeRunAI();
  }

  bindShell() {
    this.document.body.addEventListener("click", (event) =>
      this.handleClick(event),
    );
    this.document.body.addEventListener("change", (event) =>
      this.handleChange(event),
    );
    this.document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeMenu();
        this.closeOpenOverlays();
      }
    });
    this.renderRules();
    this.renderOptions();
  }

  handleClick(event) {
    const target =
      event.target instanceof this.window.Element ? event.target : null;
    if (!target) {
      return;
    }

    if (target.closest("#side-panel-overlay")) {
      this.closeMenu();
      return;
    }

    const button = target.closest("button");
    if (!button) {
      return;
    }

    if (
      this.isTrickRevealActive() &&
      (button.dataset.cardId || button.dataset.action)
    ) {
      return;
    }

    if (button.id === "hamburger-btn") {
      this.toggleMenu();
      return;
    }
    if (button.id === "sp-close") {
      this.closeMenu();
      return;
    }
    if (button.id === "sp-rules") {
      this.openOverlay("overlay-rules", "Rules");
      return;
    }
    if (button.id === "sp-options") {
      this.openOverlay("overlay-options", "Options");
      return;
    }
    if (button.id === "sp-about") {
      this.openOverlay("overlay-about", "About");
      return;
    }
    if (button.id === "sp-new-game") {
      this.clearTrickReveal();
      this.closeMenu();
      this.engine.startMatch();
      this.afterStateChange();
      return;
    }
    if (button.id === "side-panel-overlay") {
      this.closeMenu();
      return;
    }
    if (button.dataset.closeOverlay) {
      this.closeOpenOverlays();
      return;
    }
    if (button.dataset.cardId) {
      const playerIndex = Number.parseInt(
        button.dataset.playerIndex ?? "-1",
        10,
      );
      if (!Number.isInteger(playerIndex) || playerIndex < 0) {
        return;
      }
      const stateBeforeAction = this.engine.getState();
      const action = this.engine
        .getLegalActions(playerIndex)
        .find(
          (candidate) =>
            candidate.type === "play-card" &&
            candidate.cardId === button.dataset.cardId,
        );
      if (action) {
        const revealCards = this.getCompletedTrickRevealCards(
          stateBeforeAction,
          playerIndex,
          action,
        );
        this.engine.playAction(playerIndex, action);
        this.afterStateChange({ revealCards });
      }
      return;
    }

    const activePlayerIndex = this.engine.getState().currentPlayerIndex;
    const actionName = button.dataset.action;
    if (actionName === "new-match") {
      this.clearTrickReveal();
      this.engine.startMatch();
      this.afterStateChange();
      return;
    }
    if (actionName === "next-hand") {
      this.clearTrickReveal();
      this.engine.startNextHand();
      this.afterStateChange();
      return;
    }
    if (actionName === "declare-66") {
      this.engine.playAction(activePlayerIndex, { type: "declare-66" });
      this.afterStateChange();
      return;
    }
    if (actionName === "announce-marriage") {
      this.engine.playAction(activePlayerIndex, {
        type: "announce-marriage",
        suit: button.dataset.suit,
      });
      this.afterStateChange();
      return;
    }
    if (actionName === "swap-atout") {
      this.engine.playAction(activePlayerIndex, { type: "swap-atout" });
      this.afterStateChange();
      return;
    }
    if (actionName === "close-talon") {
      this.engine.playAction(activePlayerIndex, { type: "close-talon" });
      this.afterStateChange();
      return;
    }
    if (actionName === "resume-save") {
      this.persistence.saveState(this.engine.getState());
      this.engine.getState().statusMessage = STATUS_MESSAGES.saved;
      this.render();
    }
  }

  handleChange(event) {
    const target = event.target;
    if (
      !(
        target instanceof this.window.HTMLInputElement ||
        target instanceof this.window.HTMLSelectElement
      )
    ) {
      return;
    }
    if (!target.closest("#overlay-options")) {
      return;
    }

    const currentSettings = this.engine.settings || getDefaultSettings();
    const players = currentSettings.players.map((player) => ({ ...player }));

    if (target.name === "deckVariant") {
      this.engine.setSettings(
        mergeSettings(currentSettings, { deckVariant: target.value }),
      );
    } else if (target.name === "matchTarget") {
      this.engine.setSettings(
        mergeSettings(currentSettings, { matchTarget: Number(target.value) }),
      );
    } else if (target.name.startsWith("playerType-")) {
      const index = Number(target.name.split("-")[1]);
      players[index].type = target.value;
      this.engine.setSettings(mergeSettings(currentSettings, { players }));
    } else if (target.name.startsWith("playerLevel-")) {
      const index = Number(target.name.split("-")[1]);
      players[index].aiLevel = target.value;
      this.engine.setSettings(mergeSettings(currentSettings, { players }));
    }

    this.persistence.saveSettings(this.engine.settings);
    this.renderOptions();
    this.render();
  }

  afterStateChange({ revealCards = null } = {}) {
    this.persistence.saveState(this.engine.getState());

    if (revealCards && revealCards.length === 2) {
      this.startTrickReveal(revealCards);
      return;
    }

    this.render();
    this.maybeRunAI();
  }

  maybeRunAI() {
    if (this.isTrickRevealActive()) {
      return;
    }
    const state = this.engine.getState();
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (state.phase !== "playing" || currentPlayer.type !== "ai") {
      return;
    }
    this.window.clearTimeout(this.aiTimer);
    this.aiTimer = this.window.setTimeout(
      () => {
        if (this.isTrickRevealActive()) {
          return;
        }
        const stateBeforeAction = this.engine.getState();
        const move = getAIMove(
          stateBeforeAction,
          stateBeforeAction.currentPlayerIndex,
          currentPlayer.aiLevel,
        );
        if (move) {
          const revealCards = this.getCompletedTrickRevealCards(
            stateBeforeAction,
            stateBeforeAction.currentPlayerIndex,
            move,
          );
          this.engine.playAction(stateBeforeAction.currentPlayerIndex, move);
          this.afterStateChange({ revealCards });
        }
      },
      currentPlayer.aiLevel === "easy"
        ? 150
        : currentPlayer.aiLevel === "medium"
          ? 260
          : 360,
    );
  }

  render() {
    this.view.render(this.engine.getState(), {
      inputLocked: this.isTrickRevealActive(),
      displayTrickCards: this.trickRevealCards,
    });
    this.renderBadge();
  }

  isTrickRevealActive() {
    return (
      Array.isArray(this.trickRevealCards) && this.trickRevealCards.length > 0
    );
  }

  clearTrickReveal() {
    if (this.trickRevealTimer !== null) {
      this.window.clearTimeout(this.trickRevealTimer);
      this.trickRevealTimer = null;
    }
    this.trickRevealCards = null;
  }

  startTrickReveal(revealCards) {
    this.clearTrickReveal();
    this.window.clearTimeout(this.aiTimer);
    this.aiTimer = null;
    this.trickRevealCards = revealCards;
    this.render();
    this.trickRevealTimer = this.window.setTimeout(() => {
      this.engine.finalizeTrickReveal();
      this.trickRevealCards = null;
      this.trickRevealTimer = null;
      this.persistence.saveState(this.engine.getState());
      this.render();
      this.maybeRunAI();
    }, TRICK_REVEAL_DELAY_MS);
  }

  getCompletedTrickRevealCards(stateBeforeAction, playerIndex, action) {
    if (
      action.type !== "play-card" ||
      stateBeforeAction.currentTrick.cards.length !== 1
    ) {
      return null;
    }

    const playedCard = stateBeforeAction.players[playerIndex].hand.find(
      (card) => card.id === action.cardId,
    );
    if (!playedCard) {
      return null;
    }

    return [
      ...stateBeforeAction.currentTrick.cards,
      { playerIndex, card: playedCard },
    ];
  }

  renderBadge() {
    const badge = this.document.getElementById("game-badge");
    const state = this.engine.getState();
    badge.innerHTML = state.players
      .map(
        (player, index) =>
          `<span class="badge-player${state.currentPlayerIndex === index ? " badge-active" : ""}">${getPlayerDisplayTag(player, index)}: ${player.gamePoints}</span>`,
      )
      .join("");
  }

  renderRules() {
    const container = this.document.querySelector(
      "#overlay-rules .overlay-content",
    );
    container.innerHTML = `
      <h2>📖 How to Play — Schnapsen</h2>
      <h3>Objective</h3>
      <p>Build card points through tricks and marriages, then win the hand by correctly declaring 66 while on lead. The match (Bummerl) is won by reaching the configured match target.</p>
      <h3>Tricks and Talon</h3>
      <p>With an open talon, both players may play any card. After the talon is closed or exhausted, strict follow-suit and Atout obligations apply.</p>
      <p>Open-talon action: the active leader may swap the open Atout with the lowest Atout from hand (24-card: 9, 20-card: Unter) only while more than two talon cards remain. No swap is allowed after talon close.</p>
      <p>The active leader may close the talon before leading a trick card; this remains legal even after announcing a marriage as long as no trick card has been led yet.</p>
      <p>Visual states: open talon is shown crosswise over the open Atout card. Closed talon keeps the stack visible with a face-down Atout above talon. Exhausted talon hides the talon/Atout stack but keeps the Atout suit symbol visible.</p>
      <p>Terminology: this app uses <strong>Atout</strong> as the preferred label for the suit with beating priority.</p>
      <h3>Marriages</h3>
      <p>A non-Atout marriage scores 20 points; an Atout marriage scores 40 points.</p>
      <p>Marriage scoring is explicit: announce the suit first, then lead König or Ober of that suit. If you skip the announcement, no marriage points are scored.</p>
      <p>Only one marriage can be announced per lead. If two marriages are available, announce one now and the second only on a later lead after winning the previous trick.</p>
      <p>Marriage points are immediate if the announcer already has at least one won trick; otherwise they are deferred until that player wins a first trick.</p>
      <p>If immediate marriage points bring the active leader to 66 or more, declare-66 is legal immediately after the announcement and before leading the trick card.</p>
      <h3>Declaring 66 and Hand End</h3>
      <p>Declare-66 is a lead action: only the active leader may claim before leading a trick card. A correct claim (66+) wins immediately.</p>
      <p>A false claim loses immediately. The opponent scores 2 game points, or 3 if the claimant had won no trick (Schwarz).</p>
      <p>If a player closes the talon and then fails to declare 66 before cards run out, that player loses with the same 2/3 penalty scale.</p>
      <p>If nobody declares 66 and cards run out without a talon-close failure, the final trick winner takes the hand for exactly 1 game point.</p>
      <h3>UI and Match</h3>
      <p>Seat layout is fixed: South is ▼ and North is ▲. Identity tags are shown as 🧑▼/🤖▼ and 🧑▲/🤖▲. Only the active hand is face-up; all actions apply to the active player.</p>
      <p>Default match target is 7 game points. Deck variant (20-card or 24-card) and player types can be changed in options.</p>
      <p>All action buttons and card clicks target the currently active player.</p>
      <button type="button" class="overlay-close-btn" data-close-overlay="overlay-rules">OK</button>
    `;
  }

  renderOptions() {
    const settings = this.engine.settings || getDefaultSettings();
    const container = this.document.querySelector(
      "#overlay-options .overlay-content",
    );
    container.innerHTML = `
      <h2>⚙️ Options</h2>
      <div class="options-section">
        <label>Deck Variant
          <select name="deckVariant">
            <option value="24-card" ${settings.deckVariant === "24-card" ? "selected" : ""}>24-card</option>
            <option value="20-card" ${settings.deckVariant === "20-card" ? "selected" : ""}>20-card</option>
          </select>
        </label>
      </div>
      <div class="options-section">
        <label>Match Target
          <input type="number" min="1" max="15" step="1" name="matchTarget" value="${settings.matchTarget}" />
        </label>
      </div>
      ${settings.players
        .map(
          (player, index) => `<div class="options-section">
        <h3>${getPlayerDisplayTag(player, index)} (Sitz ${getSeatSymbolForIndex(index)})</h3>
        <label>Type
          <select name="playerType-${index}">
            <option value="human" ${player.type === "human" ? "selected" : ""}>human</option>
            <option value="ai" ${player.type === "ai" ? "selected" : ""}>AI</option>
          </select>
        </label>
        <label>AI Level
          <select name="playerLevel-${index}" ${player.type === "ai" ? "" : "disabled"}>
            <option value="easy" ${player.aiLevel === "easy" ? "selected" : ""}>Easy</option>
            <option value="medium" ${player.aiLevel === "medium" ? "selected" : ""}>Medium</option>
            <option value="hard" ${player.aiLevel === "hard" ? "selected" : ""}>Hard</option>
          </select>
        </label>
      </div>`,
        )
        .join("")}
      <button type="button" class="overlay-close-btn" data-close-overlay="overlay-options">OK</button>
    `;
  }

  toggleMenu() {
    const menu = this.document.getElementById("side-panel");
    const overlay = this.document.getElementById("side-panel-overlay");
    const button = this.document.getElementById("hamburger-btn");
    const willOpen = !menu.classList.contains("open");
    menu.classList.toggle("open", willOpen);
    overlay.classList.toggle("open", willOpen);
    menu.setAttribute("aria-hidden", String(!willOpen));
    overlay.setAttribute("aria-hidden", String(!willOpen));
    button.setAttribute("aria-expanded", String(willOpen));
  }

  closeMenu() {
    const menu = this.document.getElementById("side-panel");
    const overlay = this.document.getElementById("side-panel-overlay");
    const button = this.document.getElementById("hamburger-btn");
    menu.classList.remove("open");
    overlay.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-expanded", "false");
    // Keep keyboard focus predictable when dismissing the navigation menu.
    button.focus();
  }

  openOverlay(id, title) {
    this.closeMenu();
    this.closeOpenOverlays();
    const overlay = this.document.getElementById(id);
    overlay.classList.add("open");
    this.document.querySelector("#title-bar h1").textContent = title;
  }

  closeOpenOverlays() {
    this.document.querySelectorAll(".overlay-page.open").forEach((overlay) => {
      overlay.classList.remove("open");
    });
    this.document.querySelector("#title-bar h1").textContent = "Schnapsen";
  }
}
