import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import {
  determineGamePoints,
  getMarriagePoints,
  getTrickPoints,
} from "../core/scoring.js";

describe("Scoring", () => {
  // Scenario: sums trick points with schnapsen values
  // Feature: Scoring Rules (FR-CRD-003)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-CRD-003, FR-CRD-004
  it("sums trick points with schnapsen values", () => {
    const points = getTrickPoints([
      new Card("eichel", "ass"),
      new Card("blatt", "10"),
      new Card("herz", "könig"),
      new Card("schellen", "unter"),
    ]);
    expect(points).toBe(27);
  });

  // Scenario: scores marriages as 20 or 40
  // Feature: Scoring Rules (FR-MRG-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-004, FR-MRG-005
  it("scores marriages as 20 or 40", () => {
    expect(getMarriagePoints("eichel", "herz")).toBe(20);
    expect(getMarriagePoints("herz", "herz")).toBe(40);
  });

  // Scenario: computes game points for claimed-win outcomes
  // Feature: Scoring Rules (FR-END-005)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-005, FR-END-006, FR-END-007
  it("computes game points for claimed-win outcomes", () => {
    expect(determineGamePoints(34, 1)).toBe(2);
    expect(determineGamePoints(20, 1)).toBe(2);
    expect(determineGamePoints(20, 0)).toBe(3);
  });
});
