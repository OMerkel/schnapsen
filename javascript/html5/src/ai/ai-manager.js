import {
  determineTrickWinner,
  getLegalCards,
  getMarriageChoices,
} from "../core/rules.js";
import { getTrickPoints } from "../core/scoring.js";

function evaluateCard(state, playerIndex, card) {
  if (state.currentTrick.cards.length === 0) {
    const marriage = getMarriageChoices(state, playerIndex).find(
      (entry) => entry.cardId === card.id,
    );
    return marriage ? 100 + marriage.points : card.points;
  }

  const leadPlay = state.currentTrick.cards[0];
  const winner = determineTrickWinner(
    [leadPlay, { playerIndex, card }],
    state.atoutSuit,
    state.deckVariant,
  );
  return (
    (winner === playerIndex ? 50 : 0) +
    getTrickPoints([leadPlay.card, card]) -
    card.points
  );
}

export function getAIMove(state, playerIndex, level = "medium") {
  if (state.phase !== "playing" || state.currentPlayerIndex !== playerIndex) {
    return null;
  }

  const pendingMarriageIntent = state.pendingMarriageIntent;
  if (
    pendingMarriageIntent &&
    pendingMarriageIntent.playerIndex === playerIndex
  ) {
    const legalCards = getLegalCards(state, playerIndex);
    const marriageCard = legalCards.find(
      (card) =>
        card.suit === pendingMarriageIntent.suit &&
        (card.rank === "könig" || card.rank === "ober"),
    );
    if (!marriageCard) {
      return null;
    }
    return {
      type: "play-card",
      cardId: marriageCard.id,
    };
  }

  const currentPoints =
    state.players[playerIndex].trickPoints +
    state.players[playerIndex].appliedMarriagePoints;
  if (
    currentPoints >= 66 &&
    state.currentTrick.cards.length === 0 &&
    state.currentTrick.leaderIndex === playerIndex
  ) {
    return { type: "declare-66" };
  }

  if (
    level === "hard" &&
    state.currentTrick.cards.length === 0 &&
    !state.talonClosed &&
    state.talon.length > 0 &&
    currentPoints >= 45
  ) {
    return { type: "close-talon" };
  }

  const marriage = getMarriageChoices(state, playerIndex)[0];
  if (marriage && level !== "easy") {
    return {
      type: "announce-marriage",
      suit: marriage.suit,
      points: marriage.points,
    };
  }

  const legalCards = getLegalCards(state, playerIndex);
  const rankedCards = legalCards
    .map((card) => ({ card, score: evaluateCard(state, playerIndex, card) }))
    .sort((left, right) => right.score - left.score);

  if (rankedCards.length === 0) {
    return null;
  }

  const card =
    level === "hard"
      ? rankedCards[0]?.card
      : level === "medium"
        ? rankedCards[Math.floor(rankedCards.length / 2)]?.card ||
          rankedCards[0]?.card
        : rankedCards[rankedCards.length - 1]?.card || rankedCards[0]?.card;

  return {
    type: "play-card",
    cardId: card.id,
  };
}
