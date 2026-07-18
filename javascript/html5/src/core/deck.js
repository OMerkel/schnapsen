import { DECK_VARIANTS, getRankOrder, SUITS } from "../config/constants.js";
import { Card } from "./card.js";

export function createDeck(deckVariant = DECK_VARIANTS.twentyFour) {
  const ranks = getRankOrder(deckVariant);
  return SUITS.flatMap((suit) => ranks.map((rank) => new Card(suit, rank)));
}

export function createSeededRandom(seed = Date.now()) {
  let state = seed >>> 0 || 1;
  return function seededRandom() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function shuffleDeck(cards, random = Math.random) {
  const deck = [...cards];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}
