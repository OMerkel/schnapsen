import { DECK_VARIANTS, getRankOrder } from "../config/constants.js";
import { formatCardName } from "../config/messages.js";
import { getMarriagePoints } from "./scoring.js";

function getLowestRank(deckVariant = DECK_VARIANTS.twentyFour) {
  const order = getRankOrder(deckVariant);
  return order[order.length - 1];
}

export function getRankValue(rank, deckVariant = DECK_VARIANTS.twentyFour) {
  const order = getRankOrder(deckVariant);
  return order.length - order.indexOf(rank);
}

export function compareCards(
  firstCard,
  secondCard,
  ledSuit,
  atoutSuit,
  deckVariant,
) {
  const firstAtout = firstCard.suit === atoutSuit;
  const secondAtout = secondCard.suit === atoutSuit;

  if (firstAtout && !secondAtout) {
    return 1;
  }
  if (!firstAtout && secondAtout) {
    return -1;
  }
  if (firstCard.suit === secondCard.suit) {
    return Math.sign(
      getRankValue(firstCard.rank, deckVariant) -
        getRankValue(secondCard.rank, deckVariant),
    );
  }
  if (firstCard.suit === ledSuit) {
    return 1;
  }
  if (secondCard.suit === ledSuit) {
    return -1;
  }
  return 0;
}

export function determineTrickWinner(trickCards, atoutSuit, deckVariant) {
  const [leadPlay, followPlay] = trickCards;
  const comparison = compareCards(
    leadPlay.card,
    followPlay.card,
    leadPlay.card.suit,
    atoutSuit,
    deckVariant,
  );
  return comparison >= 0 ? leadPlay.playerIndex : followPlay.playerIndex;
}

export function isStrictPlay(handState) {
  return handState.talonClosed || handState.talon.length === 0;
}

export function getLegalCards(handState, playerIndex) {
  const hand = handState.players[playerIndex].hand;
  if (
    handState.currentPlayerIndex !== playerIndex ||
    handState.phase !== "playing"
  ) {
    return [];
  }
  if (handState.currentTrick.cards.length === 0 || !isStrictPlay(handState)) {
    return [...hand];
  }

  const leadCard = handState.currentTrick.cards[0].card;
  const sameSuit = hand.filter((card) => card.suit === leadCard.suit);
  if (sameSuit.length > 0) {
    const beatingCards = sameSuit.filter(
      (card) =>
        compareCards(
          card,
          leadCard,
          leadCard.suit,
          handState.atoutSuit,
          handState.deckVariant,
        ) > 0,
    );
    return beatingCards.length > 0 ? beatingCards : sameSuit;
  }

  const atoutCards = hand.filter((card) => card.suit === handState.atoutSuit);
  return atoutCards.length > 0 ? atoutCards : [...hand];
}

export function getMarriageChoices(handState, playerIndex) {
  if (
    handState.phase !== "playing" ||
    handState.currentPlayerIndex !== playerIndex ||
    handState.currentTrick.cards.length > 0
  ) {
    return [];
  }

  const hand = handState.players[playerIndex].hand;
  return hand.flatMap((card) => {
    if (card.rank !== "könig" && card.rank !== "ober") {
      return [];
    }
    const partnerRank = card.rank === "könig" ? "ober" : "könig";
    const partner = hand.find(
      (candidate) =>
        candidate.suit === card.suit && candidate.rank === partnerRank,
    );
    if (!partner) {
      return [];
    }
    return [
      {
        cardId: card.id,
        suit: card.suit,
        points: getMarriagePoints(card.suit, handState.atoutSuit),
      },
    ];
  });
}

export function getAtoutSwapCard(handState, playerIndex) {
  if (
    handState.phase !== "playing" ||
    handState.currentPlayerIndex !== playerIndex ||
    handState.talonClosed ||
    handState.talon.length <= 2 ||
    !handState.atoutCard ||
    handState.currentTrick.cards.length > 0
  ) {
    return null;
  }

  const lowestRank = getLowestRank(handState.deckVariant);
  return (
    handState.players[playerIndex].hand.find(
      (card) => card.suit === handState.atoutSuit && card.rank === lowestRank,
    ) || null
  );
}

export function explainLegalReason(handState, playerIndex) {
  const cards = getLegalCards(handState, playerIndex);
  if (!isStrictPlay(handState)) {
    return "Bei offenem Talon darf jede Karte gespielt werden.";
  }
  if (cards.length === handState.players[playerIndex].hand.length) {
    return "Kein Bedienzwang möglich. Jede Karte ist erlaubt.";
  }
  return `Strenges Spiel: ${cards.map((card) => formatCardName(card)).join(", ")} sind erlaubt.`;
}
