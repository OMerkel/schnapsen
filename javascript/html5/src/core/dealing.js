import { createDeck, shuffleDeck } from "./deck.js";

export function dealInitialHand(deckVariant, random) {
  const deck = shuffleDeck(createDeck(deckVariant), random);
  const hands = [[], []];

  for (let round = 0; round < 5; round += 1) {
    hands[0].push(deck.shift());
    hands[1].push(deck.shift());
  }

  return {
    hands,
    talon: deck,
    atoutCard: deck[deck.length - 1] || null,
  };
}

export function drawAfterTrick(talon, winnerHand, loserHand) {
  const nextTalon = [...talon];
  const winnerCards = [...winnerHand];
  const loserCards = [...loserHand];

  if (nextTalon.length > 0) {
    winnerCards.push(nextTalon.shift());
  }
  if (nextTalon.length > 0) {
    loserCards.push(nextTalon.shift());
  }

  return {
    talon: nextTalon,
    winnerHand: winnerCards,
    loserHand: loserCards,
    atoutCard: nextTalon[nextTalon.length - 1] || null,
  };
}
