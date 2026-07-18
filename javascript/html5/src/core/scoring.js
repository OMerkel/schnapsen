import { CARD_POINTS } from "../config/constants.js";

export function getCardPoints(card) {
  return CARD_POINTS[card.rank] ?? 0;
}

export function getTrickPoints(cards) {
  return cards.reduce((total, card) => total + getCardPoints(card), 0);
}

export function getMarriagePoints(suit, atoutSuit) {
  return suit === atoutSuit ? 40 : 20;
}

export function determineGamePoints(loserPoints, loserWonTrickCount) {
  void loserPoints;
  if (loserWonTrickCount === 0) {
    return 3;
  }
  return 2;
}
