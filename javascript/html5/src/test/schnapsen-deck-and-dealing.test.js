import { describe, expect, it } from "vitest";
import { DECK_VARIANTS } from "../config/constants.js";
import { dealInitialHand, drawAfterTrick } from "../core/dealing.js";
import { createDeck, createSeededRandom, shuffleDeck } from "../core/deck.js";

describe("Deck and dealing", () => {
  // Scenario: creates correct card counts for 20 and 24 card variants
  // Feature: Deck and Deal Flow (FR-CRD-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-CRD-001, FR-CRD-002
  it("creates correct card counts for 20 and 24 card variants", () => {
    expect(createDeck(DECK_VARIANTS.twenty).length).toBe(20);
    expect(createDeck(DECK_VARIANTS.twentyFour).length).toBe(24);
  });

  // Scenario: shuffles deterministically with seeded random
  // Feature: Deck and Deal Flow (NFR-REL-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: NFR-REL-001
  it("shuffles deterministically with seeded random", () => {
    const deck = createDeck(DECK_VARIANTS.twentyFour);
    const shuffledA = shuffleDeck(deck, createSeededRandom(1234));
    const shuffledB = shuffleDeck(deck, createSeededRandom(1234));
    expect(shuffledA.map((card) => card.id)).toEqual(
      shuffledB.map((card) => card.id),
    );
  });

  // Scenario: seeded random uses stable non-zero fallback for zero seed
  // Feature: Deck and Deal Flow (NFR-REL-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: NFR-REL-001
  it("creates deterministic stream when seed is zero", () => {
    const randomA = createSeededRandom(0);
    const randomB = createSeededRandom(0);
    const valuesA = [randomA(), randomA(), randomA()];
    const valuesB = [randomB(), randomB(), randomB()];
    expect(valuesA).toEqual(valuesB);
  });

  // Scenario: deals 5 cards per player and exposes Atout card
  // Feature: Deck and Deal Flow (FR-DAL-002)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-DAL-002, FR-DAL-003, FR-DAL-004
  it("deals 5 cards per player and exposes Atout card", () => {
    const deal = dealInitialHand(
      DECK_VARIANTS.twentyFour,
      createSeededRandom(99),
    );
    expect(deal.hands[0]).toHaveLength(5);
    expect(deal.hands[1]).toHaveLength(5);
    expect(deal.talon).toHaveLength(14);
    expect(deal.atoutCard).not.toBeNull();
  });

  // Scenario: draws winner first then loser
  // Feature: Deck and Deal Flow (FR-OPN-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-006
  it("draws winner first then loser", () => {
    const talon = createDeck(DECK_VARIANTS.twenty).slice(0, 4);
    const result = drawAfterTrick(talon, [], []);
    expect(result.winnerHand).toHaveLength(1);
    expect(result.loserHand).toHaveLength(1);
    expect(result.talon).toHaveLength(2);
  });

  // Scenario: gives final face-down talon card to winner and open Atout to loser
  // Feature: Deck and Deal Flow (FR-OPN-008)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-006, FR-OPN-008
  it("hands out final talon card then open Atout on last open draw", () => {
    const result = drawAfterTrick(["last-facedown", "open-atout"], [], []);
    expect(result.winnerHand).toEqual(["last-facedown"]);
    expect(result.loserHand).toEqual(["open-atout"]);
    expect(result.talon).toEqual([]);
    expect(result.atoutCard).toBeNull();
  });

  // Scenario: handles draw with empty talon without adding cards
  // Feature: Deck and Deal Flow (FR-OPN-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-006, FR-TAL-003
  it("handles draw with empty talon without adding cards", () => {
    const result = drawAfterTrick([], ["a"], ["b"]);
    expect(result.winnerHand).toEqual(["a"]);
    expect(result.loserHand).toEqual(["b"]);
    expect(result.atoutCard).toBeNull();
  });

  // Scenario: draws only for winner when exactly one talon card remains
  // Feature: Deck and Deal Flow (FR-OPN-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-006
  it("draws only winner when talon has exactly one card", () => {
    const result = drawAfterTrick(["last"], ["a"], ["b"]);
    expect(result.winnerHand).toEqual(["a", "last"]);
    expect(result.loserHand).toEqual(["b"]);
    expect(result.talon).toEqual([]);
    expect(result.atoutCard).toBeNull();
  });
});
