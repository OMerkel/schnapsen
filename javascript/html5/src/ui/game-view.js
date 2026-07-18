import {
  CARD_BACK_ASSET,
  getCardAssetPath,
  getRankOrder,
  getSuitAssetPath,
  SUIT_LABELS,
} from "../config/constants.js";
import { getPlayerDisplayTag } from "./player-labels.js";

function renderCardButton(card, selectable, playerIndex, inputLocked = false) {
  const attributes = selectable
    ? `data-card-id="${card.id}" data-player-index="${playerIndex}"${inputLocked ? " disabled" : ""}`
    : "disabled";
  return `<button type="button" class="card-element${selectable && !inputLocked ? " card-clickable" : ""}" ${attributes} aria-label="${card.label}">
    <img class="card-image" src="${getCardAssetPath(card)}" alt="${card.label}" />
  </button>`;
}

function renderTableCard(card, playerIndex, isLastPlayed) {
  const seatClass = playerIndex === 1 ? "trick-card-north" : "trick-card-south";
  const orderClass = isLastPlayed ? "trick-card-last" : "trick-card-first";
  return `<div class="card-element trick-card ${seatClass} ${orderClass}" role="img" aria-label="${card.label}">
    <img class="card-image" src="${getCardAssetPath(card)}" alt="${card.label}" />
  </div>`;
}

function renderCardBack(index) {
  return `<div class="card-element hand-back-display" aria-hidden="true" data-back-index="${index}">
    <img class="card-image" src="${CARD_BACK_ASSET}" alt="" />
  </div>`;
}

function renderSuitImage(suit, className = "atout-suit-image") {
  return `<img class="${className}" src="${getSuitAssetPath(suit)}" alt="${SUIT_LABELS[suit]}" />`;
}

function renderTalonIndicator(count) {
  return `<div class="talon-indicator card-back" aria-label="Talon mit ${count} Karten">
    <img class="card-image" src="${CARD_BACK_ASSET}" alt="" />
    <span class="talon-count-badge" aria-hidden="true">${count}x</span>
  </div>`;
}

function getTalonVisualState(state) {
  if (state.talon.length === 0) {
    return "exhausted";
  }
  return state.talonClosed ? "closed" : "open";
}

function canSwapAtoutInView(state, playerIndex) {
  if (
    state.phase !== "playing" ||
    state.currentPlayerIndex !== playerIndex ||
    state.talonClosed ||
    state.talon.length <= 2 ||
    !state.atoutCard ||
    state.currentTrick.cards.length > 0
  ) {
    return false;
  }

  const rankOrder = getRankOrder(state.deckVariant);
  const lowestRank = rankOrder[rankOrder.length - 1];
  return state.players[playerIndex].hand.some(
    (card) => card.suit === state.atoutSuit && card.rank === lowestRank,
  );
}

function canCloseTalonInView(state, playerIndex) {
  return (
    state.phase === "playing" &&
    state.currentPlayerIndex === playerIndex &&
    state.currentTrick.cards.length === 0 &&
    !state.talonClosed &&
    state.talon.length > 0
  );
}

function canDeclare66InView(state, playerIndex) {
  if (
    state.phase !== "playing" ||
    state.currentPlayerIndex !== playerIndex ||
    state.currentTrick.cards.length > 0 ||
    state.currentTrick.leaderIndex !== playerIndex
  ) {
    return false;
  }
  return true;
}

function getMarriageAnnouncementOptionsInView(state, playerIndex) {
  if (
    state.phase !== "playing" ||
    state.currentPlayerIndex !== playerIndex ||
    state.currentTrick.cards.length > 0 ||
    (state.pendingMarriageIntent &&
      state.pendingMarriageIntent.playerIndex === playerIndex)
  ) {
    return [];
  }

  const hand = state.players[playerIndex].hand;
  const suits = new Set();
  for (const card of hand) {
    if (card.rank !== "könig" && card.rank !== "ober") {
      continue;
    }
    const partnerRank = card.rank === "könig" ? "ober" : "könig";
    const hasPartner = hand.some(
      (candidate) =>
        candidate.suit === card.suit && candidate.rank === partnerRank,
    );
    if (hasPartner) {
      suits.add(card.suit);
    }
  }

  return Array.from(suits).map((suit) => ({
    suit,
    points: suit === state.atoutSuit ? 40 : 20,
  }));
}

function renderAtoutStack(state) {
  const talonVisualState = getTalonVisualState(state);
  if (!state.atoutCard || talonVisualState === "exhausted") {
    return "";
  }

  const isClosed = talonVisualState === "closed";
  const stackStateClass =
    talonVisualState === "closed" ? "atout-stack-closed" : "atout-stack-open";
  const atoutImage = isClosed
    ? CARD_BACK_ASSET
    : getCardAssetPath(state.atoutCard);
  const atoutAlt = isClosed
    ? "Atout verdeckt"
    : `Atout ${state.atoutCard.label}`;

  return `<div class="atout-stack ${stackStateClass}">
    <img class="card-image atout-card-image" src="${atoutImage}" alt="${atoutAlt}" />
    ${renderTalonIndicator(state.talon.length)}
  </div>`;
}

function renderPlayerInfo(player, playerIndex, isActive, points) {
  const deferredMarriageLabel =
    player.deferredMarriagePoints > 0
      ? `<span class="score-label">Marriage vorgemerkt: ${player.deferredMarriagePoints}</span>`
      : "";
  return `<div class="score-player${isActive ? " badge-active" : ""}">
    <strong class="score-value">${getPlayerDisplayTag(player, playerIndex)}</strong>
    <span class="score-label">Stiche: ${player.wonTrickCount}</span>
    <span class="score-label">Kartenpunkte: ${points}</span>
    ${deferredMarriageLabel}
  </div>`;
}

function renderSeatHand(state, playerIndex, inputLocked) {
  const player = state.players[playerIndex];
  if (state.phase !== "playing") {
    return "";
  }
  const isActive = state.currentPlayerIndex === playerIndex;
  if (!isActive) {
    return player.hand.map((_, index) => renderCardBack(index)).join("");
  }
  return player.hand
    .map((card) => renderCardButton(card, true, playerIndex, inputLocked))
    .join("");
}

export class GameView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(state, uiState = {}) {
    const inputLocked = Boolean(uiState.inputLocked);
    const southPlayer = state.players[0];
    const northPlayer = state.players[1];
    const activePlayerIndex = state.currentPlayerIndex;
    const trickEntries = uiState.displayTrickCards || state.currentTrick.cards;
    const trickCards = trickEntries
      .map((entry, index) =>
        renderTableCard(
          entry.card,
          entry.playerIndex,
          index === trickEntries.length - 1,
        ),
      )
      .join("");
    const emptyTrickMessage =
      state.phase === "hand-over"
        ? "<p>Hand beendet. Starte die nächste Hand.</p>"
        : state.phase === "match-over"
          ? "<p>Bummerl beendet.</p>"
          : "<p>Noch keine Karte ausgespielt.</p>";
    const pendingMarriageHint =
      state.pendingMarriageIntent &&
      state.pendingMarriageIntent.playerIndex === activePlayerIndex
        ? `<p class="marriage-pending-hint">Marriage vorbereitet: ${SUIT_LABELS[state.pendingMarriageIntent.suit]} (König + Ober)</p>`
        : "";
    const marriageOptions = getMarriageAnnouncementOptionsInView(
      state,
      activePlayerIndex,
    );
    const marriageButtons = marriageOptions
      .map(
        (option) =>
          `<button type="button" data-action="announce-marriage" data-suit="${option.suit}">Marriage ${SUIT_LABELS[option.suit]} ansagen (${option.points})</button>`,
      )
      .join("");
    const showNextHand = state.phase === "hand-over" && !inputLocked;
    const showDeclare66 =
      canDeclare66InView(state, activePlayerIndex) && !inputLocked;
    const showSwapAtout =
      canSwapAtoutInView(state, activePlayerIndex) && !inputLocked;
    const showCloseTalon =
      canCloseTalonInView(state, activePlayerIndex) && !inputLocked;
    const actionButtons = [
      showNextHand
        ? `<button type="button" data-action="next-hand">Nächste Hand</button>`
        : "",
      showDeclare66
        ? `<button type="button" data-action="declare-66">66 ansagen</button>`
        : "",
      marriageButtons,
      showSwapAtout
        ? `<button type="button" data-action="swap-atout">Atout tauschen</button>`
        : "",
      showCloseTalon
        ? `<button type="button" data-action="close-talon">Talon schließen</button>`
        : "",
      `<button type="button" data-action="resume-save">Speichern</button>`,
    ]
      .filter(Boolean)
      .join("");
    const pointsLine =
      state.phase === "playing"
        ? ""
        : `<p>Punkte: ${southPlayer.trickPoints + southPlayer.appliedMarriagePoints} : ${northPlayer.trickPoints + northPlayer.appliedMarriagePoints}</p>`;
    this.rootElement.innerHTML = `
      <section class="game-board">
        <section class="game-header">
          <div class="header-title">
            <h2>${state.phase === "match-over" ? "Bummerl beendet" : `Hand ${state.handNumber}`}</h2>
          </div>
          <div class="score-section">
            ${renderPlayerInfo(southPlayer, 0, state.currentPlayerIndex === 0, southPlayer.trickPoints + southPlayer.appliedMarriagePoints)}
            ${renderPlayerInfo(northPlayer, 1, state.currentPlayerIndex === 1, northPlayer.trickPoints + northPlayer.appliedMarriagePoints)}
          </div>
        </section>

        <section class="game-area">
          <div class="game-board-center">
            <div class="player-north-area">
              <h3>${getPlayerDisplayTag(northPlayer, 1)}</h3>
              <div class="player-north-hand" aria-label="Hand North">
                ${renderSeatHand(state, 1, inputLocked)}
              </div>
            </div>

            <div class="table-area">
              <div class="atout-panel">
                ${renderAtoutStack(state)}
                <p class="atout-suit-row">${state.atoutSuit ? renderSuitImage(state.atoutSuit) : "Kein Atout"}</p>
              </div>
              <div class="current-trick">
                <div class="current-trick-cards">${trickCards || emptyTrickMessage}</div>
              </div>
              <div class="action-panel">
                ${pendingMarriageHint}
                ${actionButtons}
              </div>
            </div>

            <div class="player-south-area">
              <h3>${getPlayerDisplayTag(southPlayer, 0)}</h3>
              <div class="player-south-hand" aria-label="Hand South">
                ${renderSeatHand(state, 0, inputLocked)}
              </div>
            </div>
          </div>
        </section>

        <section class="status-panel">
          <p>${state.statusMessage}</p>
          ${pointsLine}
          <p>Atout: ${state.atoutSuit ? renderSuitImage(state.atoutSuit, "status-atout-suit-image") : "-"} | Variante: ${state.deckVariant}</p>
          <p>Grund: ${state.winnerReason || "-"}</p>
        </section>

        <section class="history-panel">
          <h3>Handverlauf</h3>
          <ol>
            ${
              state.handHistory
                .map((entry) => {
                  const winnerType =
                    entry.winnerType || state.players[entry.winnerIndex]?.type;
                  const winnerTag = getPlayerDisplayTag(
                    { type: winnerType || "human" },
                    entry.winnerIndex,
                  );
                  return `<li>Hand ${entry.handNumber}: ${winnerTag} gewinnt (${entry.points[0]}:${entry.points[1]}) und erhält ${entry.gamePoints} Spielpunkte.</li>`;
                })
                .join("") || "<li>Noch keine beendete Hand.</li>"
            }
          </ol>
        </section>
      </section>
    `;
  }
}
