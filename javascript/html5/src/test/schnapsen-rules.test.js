import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import {
  compareCards,
  determineTrickWinner,
  explainLegalReason,
  getAtoutSwapCard,
  getLegalCards,
  getMarriageChoices,
  isStrictPlay,
} from "../core/rules.js";

function createState(overrides = {}) {
  return {
    phase: "playing",
    currentPlayerIndex: 1,
    deckVariant: "24-card",
    talonClosed: false,
    talon: [new Card("herz", "9")],
    atoutSuit: "herz",
    players: [
      { hand: [new Card("eichel", "ass")] },
      {
        hand: [
          new Card("blatt", "ass"),
          new Card("herz", "9"),
          new Card("blatt", "10"),
        ],
      },
    ],
    currentTrick: {
      cards: [{ playerIndex: 0, card: new Card("blatt", "unter") }],
    },
    ...overrides,
  };
}

describe("Rules", () => {
  // Scenario: allows any hand card while talon is open
  // Feature: Rules Engine Behavior (FR-OPN-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-001, FR-OPN-002
  it("allows any hand card while talon is open", () => {
    const state = createState({
      talonClosed: false,
      talon: [new Card("herz", "9")],
      currentTrick: {
        cards: [{ playerIndex: 0, card: new Card("blatt", "unter") }],
      },
      currentPlayerIndex: 1,
    });

    const legal = getLegalCards(state, 1);
    expect(legal.map((card) => card.id)).toEqual(
      state.players[1].hand.map((card) => card.id),
    );
  });

  // Scenario: compares Atout over non-Atout
  // Feature: Rules Engine Behavior (FR-OPN-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-004
  it("compares Atout over non-Atout", () => {
    const result = compareCards(
      new Card("herz", "9"),
      new Card("blatt", "ass"),
      "blatt",
      "herz",
      "24-card",
    );
    expect(result).toBe(1);
  });

  // Scenario: covers remaining compareCards ordering branches
  // Feature: Rules Engine Behavior (FR-OPN-003)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-003, FR-OPN-004, FR-OPN-005
  it("covers remaining compareCards ordering branches", () => {
    expect(
      compareCards(
        new Card("blatt", "9"),
        new Card("herz", "9"),
        "blatt",
        "herz",
        "24-card",
      ),
    ).toBe(-1);

    expect(
      compareCards(
        new Card("blatt", "9"),
        new Card("eichel", "9"),
        "blatt",
        "herz",
        "24-card",
      ),
    ).toBe(1);

    expect(
      compareCards(
        new Card("eichel", "9"),
        new Card("schellen", "9"),
        "blatt",
        "herz",
        "24-card",
      ),
    ).toBe(0);
  });

  // Scenario: determines trick winner by rank in same suit
  // Feature: Rules Engine Behavior (FR-OPN-003)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-003, FR-OPN-005
  it("determines trick winner by rank in same suit", () => {
    const winner = determineTrickWinner(
      [
        { playerIndex: 0, card: new Card("blatt", "ober") },
        { playerIndex: 1, card: new Card("blatt", "könig") },
      ],
      "herz",
      "24-card",
    );
    expect(winner).toBe(1);
  });

  // Scenario: applies 20-card rank order Ass > Zehn > König > Ober > Unter
  // Feature: Rules Engine Behavior (FR-CRD-005)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-CRD-005
  it("applies expected rank order in 20-card variant", () => {
    expect(
      compareCards(
        new Card("blatt", "ass"),
        new Card("blatt", "10"),
        "blatt",
        "herz",
        "20-card",
      ),
    ).toBe(1);
    expect(
      compareCards(
        new Card("blatt", "10"),
        new Card("blatt", "könig"),
        "blatt",
        "herz",
        "20-card",
      ),
    ).toBe(1);
    expect(
      compareCards(
        new Card("blatt", "könig"),
        new Card("blatt", "ober"),
        "blatt",
        "herz",
        "20-card",
      ),
    ).toBe(1);
    expect(
      compareCards(
        new Card("blatt", "ober"),
        new Card("blatt", "unter"),
        "blatt",
        "herz",
        "20-card",
      ),
    ).toBe(1);
  });

  // Scenario: applies 24-card rank order Ass > Zehn > König > Ober > Unter > 9
  // Feature: Rules Engine Behavior (FR-CRD-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-CRD-006
  it("applies expected rank order in 24-card variant", () => {
    expect(
      compareCards(
        new Card("blatt", "unter"),
        new Card("blatt", "9"),
        "blatt",
        "herz",
        "24-card",
      ),
    ).toBe(1);
  });

  // Scenario: uses strict play after talon closes
  // Feature: Rules Engine Behavior (FR-STR-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-STR-001, FR-STR-002, FR-STR-003, FR-TAL-004
  it("uses strict play after talon closes", () => {
    const state = createState({ talonClosed: true, talon: [] });
    expect(isStrictPlay(state)).toBe(true);
    const legal = getLegalCards(state, 1);
    expect(legal.map((card) => card.id)).toEqual(["blatt:ass", "blatt:10"]);
  });

  // Scenario: uses strict play after talon exhausts without close
  // Feature: Rules Engine Behavior (FR-STR-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-STR-001, FR-STR-004, FR-STR-006
  it("uses strict play after talon exhausts without close", () => {
    const state = createState({
      talonClosed: false,
      talon: [],
      atoutSuit: "herz",
      players: [
        { hand: [new Card("blatt", "ass")] },
        { hand: [new Card("herz", "9"), new Card("schellen", "unter")] },
      ],
      currentTrick: {
        cards: [{ playerIndex: 0, card: new Card("blatt", "10") }],
      },
      currentPlayerIndex: 1,
    });

    expect(isStrictPlay(state)).toBe(true);
    const legal = getLegalCards(state, 1);
    expect(legal.map((card) => card.id)).toEqual(["herz:9"]);
  });

  // Scenario: requires Atout when follow suit is impossible in strict mode
  // Feature: Rules Engine Behavior (FR-STR-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-STR-001, FR-STR-004
  it("requires Atout when follow suit is impossible in strict mode", () => {
    const state = createState({
      talonClosed: true,
      talon: [],
      atoutSuit: "herz",
      players: [
        { hand: [new Card("blatt", "ass")] },
        { hand: [new Card("herz", "9"), new Card("schellen", "unter")] },
      ],
      currentTrick: {
        cards: [{ playerIndex: 0, card: new Card("blatt", "10") }],
      },
      currentPlayerIndex: 1,
    });

    const legal = getLegalCards(state, 1);
    expect(legal.map((card) => card.id)).toEqual(["herz:9"]);
  });

  // Scenario: returns marriage choices only for leader
  // Feature: Rules Engine Behavior (FR-MRG-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-001, FR-MRG-002, FR-MRG-004, FR-MRG-005
  it("returns marriage choices only for leader", () => {
    const state = createState({
      currentPlayerIndex: 0,
      currentTrick: { cards: [] },
      players: [
        { hand: [new Card("herz", "könig"), new Card("herz", "ober")] },
        { hand: [] },
      ],
    });
    const choices = getMarriageChoices(state, 0);
    expect(choices).toHaveLength(2);
    expect(choices[0].points).toBe(40);
  });

  // Scenario: provides legal reason text for open and strict talon
  // Feature: Rules Engine Behavior (FR-STR-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-STR-001, FR-STR-005, FR-UIR-004
  it("provides legal reason text for open and strict talon", () => {
    const openState = createState({
      talonClosed: false,
      currentTrick: { cards: [] },
      currentPlayerIndex: 1,
    });
    const strictState = createState({ talonClosed: true, talon: [] });
    const freeStrictState = createState({
      talonClosed: true,
      talon: [],
      atoutSuit: "herz",
      players: [
        { hand: [new Card("blatt", "ass")] },
        { hand: [new Card("eichel", "9")] },
      ],
      currentTrick: {
        cards: [{ playerIndex: 0, card: new Card("blatt", "10") }],
      },
      currentPlayerIndex: 1,
    });
    const wrongTurnState = createState({ currentPlayerIndex: 0 });

    expect(explainLegalReason(openState, 1)).toContain("offenem Talon");
    expect(explainLegalReason(strictState, 1)).toContain("Strenges Spiel");
    expect(explainLegalReason(freeStrictState, 1)).toContain(
      "Kein Bedienzwang",
    );
    expect(getLegalCards(wrongTurnState, 1)).toEqual([]);
  });

  // Scenario: allows Atout swap with lowest Atout in 24-card mode
  // Feature: Rules Engine Behavior (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("finds swap card for lowest Atout in 24-card mode", () => {
    const state = createState({
      deckVariant: "24-card",
      currentPlayerIndex: 1,
      currentTrick: { cards: [] },
      talonClosed: false,
      talon: [
        new Card("herz", "ass"),
        new Card("blatt", "unter"),
        new Card("herz", "könig"),
      ],
      atoutSuit: "herz",
      atoutCard: new Card("herz", "könig"),
      players: [
        { hand: [new Card("blatt", "ass")] },
        {
          hand: [new Card("herz", "9"), new Card("eichel", "unter")],
          wonTrickCount: 1,
        },
      ],
    });

    const swapCard = getAtoutSwapCard(state, 1);
    expect(swapCard?.id).toBe("herz:9");
  });

  // Scenario: allows Atout swap with lowest Atout in 20-card mode
  // Feature: Rules Engine Behavior (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("finds swap card for lowest Atout in 20-card mode", () => {
    const state = createState({
      deckVariant: "20-card",
      currentPlayerIndex: 1,
      currentTrick: { cards: [] },
      talonClosed: false,
      talon: [
        new Card("herz", "ass"),
        new Card("blatt", "unter"),
        new Card("herz", "könig"),
      ],
      atoutSuit: "herz",
      atoutCard: new Card("herz", "könig"),
      players: [
        { hand: [new Card("blatt", "ass")] },
        {
          hand: [new Card("herz", "unter"), new Card("eichel", "unter")],
          wonTrickCount: 1,
        },
      ],
    });

    const swapCard = getAtoutSwapCard(state, 1);
    expect(swapCard?.id).toBe("herz:unter");
  });

  // Scenario: disallows Atout swap when talon is closed
  // Feature: Rules Engine Behavior (FR-TAL-007)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-007
  it("returns no swap card when talon is closed", () => {
    const state = createState({
      deckVariant: "24-card",
      currentPlayerIndex: 1,
      currentTrick: { cards: [] },
      talonClosed: true,
      talon: [new Card("herz", "ass")],
      atoutSuit: "herz",
      atoutCard: new Card("herz", "könig"),
      players: [
        { hand: [new Card("blatt", "ass")] },
        { hand: [new Card("herz", "9")] },
      ],
    });

    expect(getAtoutSwapCard(state, 1)).toBeNull();
  });

  // Scenario: disallows Atout swap when talon has only one face-down card left
  // Feature: Rules Engine Behavior (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("returns no swap card when talon length is two", () => {
    const state = createState({
      deckVariant: "24-card",
      currentPlayerIndex: 1,
      currentTrick: { cards: [] },
      talonClosed: false,
      talon: [new Card("herz", "ass"), new Card("herz", "könig")],
      atoutSuit: "herz",
      atoutCard: new Card("herz", "könig"),
      players: [
        { hand: [new Card("blatt", "ass")] },
        { hand: [new Card("herz", "9")], wonTrickCount: 1 },
      ],
    });

    expect(getAtoutSwapCard(state, 1)).toBeNull();
  });

  // Scenario: allows Atout swap before swapper has won a trick in 20-card mode
  // Feature: Rules Engine Behavior (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("returns swap card in 20-card mode when player has no won trick", () => {
    const state = createState({
      deckVariant: "20-card",
      currentPlayerIndex: 1,
      currentTrick: { cards: [] },
      talonClosed: false,
      talon: [
        new Card("herz", "ass"),
        new Card("blatt", "unter"),
        new Card("herz", "könig"),
      ],
      atoutSuit: "herz",
      atoutCard: new Card("herz", "könig"),
      players: [
        { hand: [new Card("blatt", "ass")] },
        { hand: [new Card("herz", "unter")], wonTrickCount: 0 },
      ],
    });

    expect(getAtoutSwapCard(state, 1)?.id).toBe("herz:unter");
  });

  // Scenario: allows Atout swap in 24-card mode before first won trick
  // Feature: Rules Engine Behavior (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("returns swap card in 24-card mode even when player has no won trick", () => {
    const state = createState({
      deckVariant: "24-card",
      currentPlayerIndex: 1,
      currentTrick: { cards: [] },
      talonClosed: false,
      talon: [
        new Card("herz", "ass"),
        new Card("blatt", "unter"),
        new Card("herz", "könig"),
      ],
      atoutSuit: "herz",
      atoutCard: new Card("herz", "könig"),
      players: [
        { hand: [new Card("blatt", "ass")] },
        { hand: [new Card("herz", "9")], wonTrickCount: 0 },
      ],
    });

    expect(getAtoutSwapCard(state, 1)?.id).toBe("herz:9");
  });
});
