import { normalizeSettings } from "../config/configuration.js";
import { STATUS_MESSAGES } from "../config/messages.js";
import { dealInitialHand, drawAfterTrick } from "./dealing.js";
import { createSeededRandom } from "./deck.js";
import { createMatchState, createPlayerState } from "./game-state.js";
import {
  determineTrickWinner,
  getAtoutSwapCard,
  getLegalCards,
  getMarriageChoices,
} from "./rules.js";
import { determineGamePoints, getTrickPoints } from "./scoring.js";

function cloneCards(cards) {
  return cards.map((card) => card);
}

function getSeatSymbol(index) {
  return index === 0 ? "▼" : "▲";
}

function getTypeSymbol(playerType) {
  return playerType === "ai" ? "🤖" : "🧑";
}

export class GameEngine {
  constructor(settings = {}, seed = Date.now()) {
    this.settings = normalizeSettings(settings);
    this.seed = seed;
    this.random = createSeededRandom(seed);
    this.state = createMatchState(this.settings);
  }

  getState() {
    return this.state;
  }

  setSettings(nextSettings) {
    this.settings = normalizeSettings(nextSettings);
    if (this.state.phase === "setup") {
      this.state = createMatchState(this.settings);
    }
    return this.settings;
  }

  startMatch(seed = Date.now()) {
    this.seed = seed;
    this.random = createSeededRandom(seed);
    this.state = createMatchState(this.settings);
    this.state.dealerIndex = Math.floor(this.random() * 2);
    return this.startNextHand();
  }

  startNextHand() {
    const carryScores = this.state.players.map((player) => player.gamePoints);
    const history = [...this.state.handHistory];
    const dealerIndex =
      this.state.handNumber === 0
        ? this.state.dealerIndex
        : 1 - this.state.dealerIndex;
    const players = this.settings.players.map((playerSettings, index) => {
      const player = createPlayerState(index, playerSettings);
      player.gamePoints = carryScores[index] || 0;
      return player;
    });

    const initialDeal = dealInitialHand(this.settings.deckVariant, this.random);
    players[0].hand = cloneCards(initialDeal.hands[0]);
    players[1].hand = cloneCards(initialDeal.hands[1]);

    this.state = {
      ...createMatchState(this.settings),
      phase: "playing",
      players,
      dealerIndex,
      leaderIndex: 1 - dealerIndex,
      currentPlayerIndex: 1 - dealerIndex,
      currentTrick: {
        leaderIndex: 1 - dealerIndex,
        cards: [],
      },
      talon: cloneCards(initialDeal.talon),
      atoutCard: initialDeal.atoutCard,
      atoutSuit: initialDeal.atoutCard?.suit || null,
      handNumber: history.length + 1,
      handHistory: history,
      statusMessage: `${this.getPlayerStatusLabel(1 - dealerIndex)} führt die Hand an.`,
      deckVariant: this.settings.deckVariant,
    };
    return this.state;
  }

  resume(state) {
    this.state = state;
    this.settings = normalizeSettings(state.settings);
    return this.state;
  }

  canCloseTalon(playerIndex) {
    return (
      this.state.phase === "playing" &&
      this.state.currentPlayerIndex === playerIndex &&
      this.state.currentTrick.cards.length === 0 &&
      !this.state.talonClosed &&
      this.state.talon.length > 0
    );
  }

  canSwapAtout(playerIndex) {
    return Boolean(getAtoutSwapCard(this.state, playerIndex));
  }

  canDeclare66(playerIndex) {
    return (
      this.state.phase === "playing" &&
      this.state.currentPlayerIndex === playerIndex &&
      this.state.currentTrick.cards.length === 0 &&
      this.state.currentTrick.leaderIndex === playerIndex
    );
  }

  getFailedClaimPenalty(playerIndex) {
    return this.state.players[playerIndex].wonTrickCount === 0 ? 3 : 2;
  }

  getCurrentPoints(playerIndex) {
    const player = this.state.players[playerIndex];
    return player.trickPoints + player.appliedMarriagePoints;
  }

  getPlayerStatusLabel(playerIndex) {
    const player = this.state.players[playerIndex];
    return `${getTypeSymbol(player.type)}${getSeatSymbol(playerIndex)}`;
  }

  getLegalActions(playerIndex) {
    if (
      this.state.phase !== "playing" ||
      this.state.pendingTrickDraw ||
      this.state.currentPlayerIndex !== playerIndex
    ) {
      return [];
    }

    const pendingMarriageIntent = this.state.pendingMarriageIntent;
    let legalCards = getLegalCards(this.state, playerIndex);
    if (
      pendingMarriageIntent &&
      pendingMarriageIntent.playerIndex === playerIndex &&
      this.state.currentTrick.cards.length === 0
    ) {
      legalCards = legalCards.filter(
        (card) =>
          card.suit === pendingMarriageIntent.suit &&
          (card.rank === "könig" || card.rank === "ober"),
      );
    }

    const actions = legalCards.map((card) => ({
      type: "play-card",
      cardId: card.id,
    }));

    if (
      pendingMarriageIntent &&
      pendingMarriageIntent.playerIndex === playerIndex
    ) {
      if (this.canCloseTalon(playerIndex)) {
        actions.unshift({ type: "close-talon" });
      }
      if (this.canDeclare66(playerIndex)) {
        actions.unshift({ type: "declare-66" });
      }
      return actions;
    }

    const announceBySuit = new Map();
    for (const marriage of getMarriageChoices(this.state, playerIndex)) {
      if (!announceBySuit.has(marriage.suit)) {
        announceBySuit.set(marriage.suit, {
          type: "announce-marriage",
          suit: marriage.suit,
          points: marriage.points,
        });
      }
    }
    if (announceBySuit.size > 0) {
      actions.unshift(...announceBySuit.values());
    }

    if (this.canCloseTalon(playerIndex)) {
      actions.unshift({ type: "close-talon" });
    }
    if (this.canSwapAtout(playerIndex)) {
      actions.unshift({ type: "swap-atout" });
    }
    if (this.canDeclare66(playerIndex)) {
      actions.unshift({ type: "declare-66" });
    }
    return actions;
  }

  playAction(playerIndex, action) {
    if (
      this.state.currentPlayerIndex !== playerIndex ||
      this.state.phase !== "playing" ||
      this.state.pendingTrickDraw
    ) {
      return { success: false, error: STATUS_MESSAGES.illegal };
    }

    const pendingMarriageIntent = this.state.pendingMarriageIntent;
    if (
      pendingMarriageIntent &&
      pendingMarriageIntent.playerIndex === playerIndex &&
      action.type !== "play-card" &&
      action.type !== "declare-66" &&
      action.type !== "close-talon"
    ) {
      return { success: false, error: STATUS_MESSAGES.illegal };
    }

    if (action.type === "close-talon") {
      if (!this.canCloseTalon(playerIndex)) {
        return { success: false, error: STATUS_MESSAGES.illegal };
      }
      this.state.talonClosed = true;
      this.state.talonClosedBy = playerIndex;
      this.state.statusMessage = STATUS_MESSAGES.talonClosed(
        this.getPlayerStatusLabel(playerIndex),
      );
      return { success: true, state: this.state };
    }

    if (action.type === "swap-atout") {
      const swapCard = getAtoutSwapCard(this.state, playerIndex);
      if (!swapCard) {
        return { success: false, error: STATUS_MESSAGES.illegal };
      }

      const currentOpenAtout = this.state.atoutCard;

      this.state.players[playerIndex].hand = this.state.players[
        playerIndex
      ].hand.map((card) => (card.id === swapCard.id ? currentOpenAtout : card));

      // Keep talon model and exposed open-Atout model in sync after swap.
      if (this.state.talon.length > 0) {
        this.state.talon[this.state.talon.length - 1] = swapCard;
      }
      this.state.atoutCard = swapCard;
      this.state.statusMessage = STATUS_MESSAGES.atoutSwapped(
        this.getPlayerStatusLabel(playerIndex),
      );
      return { success: true, state: this.state };
    }

    if (action.type === "declare-66") {
      if (!this.canDeclare66(playerIndex)) {
        return { success: false, error: STATUS_MESSAGES.illegal };
      }
      this.state.statusMessage = STATUS_MESSAGES.declare66(
        this.getPlayerStatusLabel(playerIndex),
      );

      if (this.getCurrentPoints(playerIndex) >= 66) {
        this.finishHand(playerIndex, "declared-66");
      } else {
        this.finishHand(1 - playerIndex, "declared-66-failed", {
          forcedGamePoints: this.getFailedClaimPenalty(playerIndex),
        });
      }
      return { success: true, state: this.state };
    }

    if (action.type === "announce-marriage") {
      if (this.state.currentTrick.cards.length > 0 || pendingMarriageIntent) {
        return { success: false, error: STATUS_MESSAGES.illegal };
      }
      const announcement = getMarriageChoices(this.state, playerIndex).find(
        (choice) => choice.suit === action.suit,
      );
      if (!announcement) {
        return { success: false, error: STATUS_MESSAGES.illegal };
      }

      this.state.pendingMarriageIntent = {
        playerIndex,
        suit: announcement.suit,
        points: announcement.points,
      };
      if (this.state.players[playerIndex].wonTrickCount > 0) {
        this.state.players[playerIndex].appliedMarriagePoints +=
          announcement.points;
      } else {
        this.state.players[playerIndex].deferredMarriagePoints +=
          announcement.points;
      }
      this.state.statusMessage = STATUS_MESSAGES.marriageAnnounced(
        this.getPlayerStatusLabel(playerIndex),
        announcement.suit,
      );
      return { success: true, state: this.state };
    }

    if (action.type !== "play-card") {
      return { success: false, error: STATUS_MESSAGES.illegal };
    }

    const legalCards = getLegalCards(this.state, playerIndex);
    const card = legalCards.find((candidate) => candidate.id === action.cardId);
    if (!card) {
      return { success: false, error: STATUS_MESSAGES.illegal };
    }

    if (
      pendingMarriageIntent &&
      pendingMarriageIntent.playerIndex === playerIndex
    ) {
      const isValidMarriageLead =
        this.state.currentTrick.cards.length === 0 &&
        card.suit === pendingMarriageIntent.suit &&
        (card.rank === "könig" || card.rank === "ober");
      if (!isValidMarriageLead) {
        return { success: false, error: STATUS_MESSAGES.illegal };
      }
    }

    this.state.players[playerIndex].hand = this.state.players[
      playerIndex
    ].hand.filter((handCard) => handCard.id !== card.id);
    this.state.currentTrick.cards.push({ playerIndex, card });

    if (
      pendingMarriageIntent &&
      pendingMarriageIntent.playerIndex === playerIndex
    ) {
      this.state.pendingAnnouncement = {
        playerIndex,
        suit: card.suit,
        points: pendingMarriageIntent.points,
      };
      this.state.pendingMarriageIntent = null;
      this.state.statusMessage = STATUS_MESSAGES.marriageScored(
        this.getPlayerStatusLabel(playerIndex),
        pendingMarriageIntent.points,
      );
    }

    if (this.state.currentTrick.cards.length === 1) {
      this.state.currentPlayerIndex = 1 - playerIndex;
      return { success: true, state: this.state };
    }

    this.resolveCompletedTrick();
    return { success: true, state: this.state };
  }

  resolveCompletedTrick() {
    const winnerIndex = determineTrickWinner(
      this.state.currentTrick.cards,
      this.state.atoutSuit,
      this.state.deckVariant,
    );
    const loserIndex = 1 - winnerIndex;
    const winner = this.state.players[winnerIndex];
    const loser = this.state.players[loserIndex];
    const trickCards = this.state.currentTrick.cards.map((entry) => entry.card);
    const trickPoints = getTrickPoints(trickCards);

    winner.wonTrickCount += 1;
    winner.wonCards.push(...trickCards);
    winner.trickPoints += trickPoints;
    if (winner.deferredMarriagePoints > 0) {
      winner.appliedMarriagePoints += winner.deferredMarriagePoints;
      winner.deferredMarriagePoints = 0;
    }

    if (!this.state.talonClosed && this.state.talon.length > 0) {
      this.state.pendingTrickDraw = { winnerIndex, loserIndex };
    } else {
      this.state.pendingTrickDraw = null;
    }

    this.state.leaderIndex = winnerIndex;
    this.state.currentPlayerIndex = winnerIndex;
    this.state.currentTrick = {
      leaderIndex: winnerIndex,
      cards: [],
    };
    this.state.pendingAnnouncement = null;
    this.state.pendingMarriageIntent = null;
    this.state.statusMessage = `${this.getPlayerStatusLabel(winnerIndex)} sticht und führt weiter.`;

    if (
      !this.state.pendingTrickDraw &&
      winner.hand.length === 0 &&
      loser.hand.length === 0
    ) {
      this.finishHandByPoints();
    }
  }

  finalizeTrickReveal() {
    const pendingDraw = this.state.pendingTrickDraw;
    if (!pendingDraw) {
      return this.state;
    }

    const winner = this.state.players[pendingDraw.winnerIndex];
    const loser = this.state.players[pendingDraw.loserIndex];
    const drawResult = drawAfterTrick(
      this.state.talon,
      winner.hand,
      loser.hand,
    );
    winner.hand = drawResult.winnerHand;
    loser.hand = drawResult.loserHand;
    this.state.talon = drawResult.talon;
    this.state.atoutCard = drawResult.atoutCard;
    this.state.pendingTrickDraw = null;

    if (winner.hand.length === 0 && loser.hand.length === 0) {
      this.finishHandByPoints();
    }

    return this.state;
  }

  finishHandByPoints() {
    if (this.state.talonClosedBy !== null) {
      const closerIndex = this.state.talonClosedBy;
      const closerReached66 = this.getCurrentPoints(closerIndex) >= 66;

      if (!closerReached66) {
        this.finishHand(1 - closerIndex, "closed-talon-failed", {
          forcedGamePoints: this.getFailedClaimPenalty(closerIndex),
        });
        return;
      }

      this.finishHand(closerIndex, "closed-talon-made");
      return;
    }

    const winnerIndex = this.state.leaderIndex;
    this.finishHand(winnerIndex, "final-trick", { forcedGamePoints: 1 });
  }

  finishHand(winnerIndex, winnerReason, options = {}) {
    const loserIndex = 1 - winnerIndex;
    const winner = this.state.players[winnerIndex];
    const loser = this.state.players[loserIndex];
    const gamePoints =
      options.forcedGamePoints ??
      determineGamePoints(
        this.getCurrentPoints(loserIndex),
        loser.wonTrickCount,
      );
    winner.gamePoints += gamePoints;

    this.state.handHistory = [
      ...this.state.handHistory,
      {
        handNumber: this.state.handNumber,
        winnerIndex,
        winnerType: winner.type,
        winnerReason,
        gamePoints,
        points: [this.getCurrentPoints(0), this.getCurrentPoints(1)],
        talonClosedBy: this.state.talonClosedBy,
      },
    ];

    const matchWinner =
      winner.gamePoints >= this.settings.matchTarget ? winnerIndex : null;
    this.state.phase = matchWinner === null ? "hand-over" : "match-over";
    this.state.matchWinner = matchWinner;
    this.state.winnerReason = winnerReason;
    this.state.statusMessage =
      matchWinner === null
        ? STATUS_MESSAGES.handWon(
            this.getPlayerStatusLabel(winnerIndex),
            gamePoints,
          )
        : STATUS_MESSAGES.matchWon(this.getPlayerStatusLabel(winnerIndex));
  }
}
