import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";

describe("Card", () => {
  // Scenario: Create an Individual Card
  // Feature: Card Representation (FR-CRD-003, FR-CRD-007)
  // Req IDs: FR-CRD-003, FR-CRD-007
  it("creates immutable card with schnapsen label", () => {
    // Given a card with suit "Eichel", rank "Ass", and value 11
    // When the card is created
    const card = new Card("eichel", "ass");

    // Then the card should have suit "Eichel", rank "Ass", and value 11
    expect(card.points).toBe(11);
    expect(card.label).toBe("Ass von Eichel");
    expect(card.shortLabel).toBe("A Eichel");
    expect(Object.isFrozen(card)).toBe(true);
  });

  // Scenario: Card Equality Comparison
  // Feature: Card Equality (FR-CRD-003)
  // Req IDs: FR-CRD-003
  it("compares card identity via equals", () => {
    // Given two cards with identical suit and rank ("Eichel", "Ass")
    const left = new Card("herz", "10");
    const right = new Card("herz", "10");

    // When comparing them for equality
    // Then the comparison should return true
    expect(left.equals(right)).toBe(true);

    // Given two cards with different suits ("Eichel", "Ass") vs ("Herz", "Ass")
    const other = new Card("blatt", "10");

    // When comparing them for equality
    // Then the comparison should return false
    expect(left.equals(other)).toBe(false);
    expect(left.equals(null)).toBe(false);
  });

  // Scenario: Card conversion and fallback points handling
  // Feature: Card Representation (FR-CRD-003)
  // Req IDs: FR-CRD-003
  it("supports Card.from branches and unknown rank fallback", () => {
    const existing = new Card("herz", "unter");
    expect(Card.from(existing)).toBe(existing);

    const created = Card.from({ suit: "blatt", rank: "ass" });
    expect(created).toBeInstanceOf(Card);
    expect(created.id).toBe("blatt:ass");

    const unknown = new Card("herz", "joker");
    expect(unknown.points).toBe(0);
  });
});
