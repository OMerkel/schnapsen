import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import { GameEngine } from "../core/game-engine.js";

function findPlayableAction(actions) {
  return actions.find((action) => action.type === "play-card");
}

describe("GameEngine", () => {
  // Scenario: starts match and hand with correct base state
  // Feature: Hand Flow and Resolution (FR-DAL-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-DAL-001, FR-DAL-002, FR-DAL-003, FR-DAL-004, FR-DAL-005
  it("starts match and hand with correct base state", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(1);
    expect(state.phase).toBe("playing");
    expect(state.players[0].hand).toHaveLength(5);
    expect(state.players[1].hand).toHaveLength(5);
    expect(state.talon.length).toBeGreaterThan(0);
  });

  // Scenario: allows close talon only for active leader before card
  // Feature: Hand Flow and Resolution (FR-TAL-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-001, FR-TAL-002
  it("allows close talon only for active leader before card", () => {
    const engine = new GameEngine();
    engine.startMatch(2);
    const state = engine.getState();
    const active = state.currentPlayerIndex;
    expect(engine.canCloseTalon(active)).toBe(true);
    const result = engine.playAction(active, { type: "close-talon" });
    expect(result.success).toBe(true);
    expect(engine.getState().talonClosed).toBe(true);
  });

  // Scenario: plays trick and advances turn
  // Feature: Hand Flow and Resolution (FR-OPN-007)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-007
  it("plays trick and advances turn", () => {
    const engine = new GameEngine();
    engine.startMatch(3);

    const firstPlayer = engine.getState().currentPlayerIndex;
    const firstAction = findPlayableAction(engine.getLegalActions(firstPlayer));
    expect(engine.playAction(firstPlayer, firstAction).success).toBe(true);

    const secondPlayer = engine.getState().currentPlayerIndex;
    const secondAction = findPlayableAction(
      engine.getLegalActions(secondPlayer),
    );
    expect(engine.playAction(secondPlayer, secondAction).success).toBe(true);

    expect(engine.getState().currentTrick.cards).toHaveLength(0);
  });

  // Scenario: enables next-trick actions only after reveal-phase draw finalization
  // Feature: Hand Flow and Resolution (FR-OPN-007)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-007, FR-OPN-008
  it("shows next actions only after deferred post-trick draw is finalized", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(57);
    const leader = state.currentPlayerIndex;
    const follower = 1 - leader;

    state.talonClosed = false;
    state.atoutSuit = "herz";
    state.talon = [
      new Card("eichel", "unter"),
      new Card("blatt", "unter"),
      new Card("herz", "ober"),
    ];
    state.atoutCard = state.talon.at(-1);
    state.players[leader].hand = [new Card("blatt", "ass")];
    state.players[follower].hand = [new Card("blatt", "10")];
    state.currentTrick.cards = [];

    expect(
      engine.playAction(leader, { type: "play-card", cardId: "blatt:ass" })
        .success,
    ).toBe(true);
    expect(
      engine.playAction(follower, { type: "play-card", cardId: "blatt:10" })
        .success,
    ).toBe(true);

    expect(state.pendingTrickDraw).not.toBeNull();
    expect(engine.getLegalActions(state.currentPlayerIndex)).toEqual([]);

    engine.finalizeTrickReveal();

    expect(state.pendingTrickDraw).toBeNull();
    expect(
      engine.getLegalActions(state.currentPlayerIndex).length,
    ).toBeGreaterThan(0);
  });

  // Scenario: distributes last talon card and open Atout when talon exhausts
  // Feature: Hand Flow and Resolution (FR-OPN-008)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPN-006, FR-OPN-008, FR-STR-006
  it("gives winner the final facedown talon card and loser the open Atout", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(35);
    const leader = state.currentPlayerIndex;
    const follower = 1 - leader;

    state.talonClosed = false;
    state.atoutSuit = "herz";
    state.talon = [new Card("eichel", "ass"), new Card("herz", "unter")];
    state.atoutCard = state.talon[1];
    state.players[leader].hand = [new Card("blatt", "ass")];
    state.players[follower].hand = [new Card("blatt", "10")];
    state.currentTrick.cards = [];

    expect(
      engine.playAction(leader, { type: "play-card", cardId: "blatt:ass" })
        .success,
    ).toBe(true);
    expect(
      engine.playAction(follower, { type: "play-card", cardId: "blatt:10" })
        .success,
    ).toBe(true);

    engine.finalizeTrickReveal();

    expect(state.players[leader].hand.map((card) => card.id)).toEqual([
      "eichel:ass",
    ]);
    expect(state.players[follower].hand.map((card) => card.id)).toEqual([
      "herz:unter",
    ]);
    expect(state.talon).toEqual([]);
    expect(state.atoutCard).toBeNull();
    expect(state.atoutSuit).toBe("herz");
  });

  // Scenario: rejects illegal card actions
  // Feature: Hand Flow and Resolution (FR-UIR-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-UIR-004, NFR-REL-002
  it("rejects illegal card actions", () => {
    const engine = new GameEngine();
    engine.startMatch(4);
    const result = engine.playAction(engine.getState().currentPlayerIndex, {
      type: "play-card",
      cardId: "nope",
    });
    expect(result.success).toBe(false);
  });

  // Scenario: rejects wrong-turn and unknown action types
  // Feature: Hand Flow and Resolution (NFR-REL-002)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: NFR-REL-002
  it("rejects wrong-turn and unknown action types", () => {
    const engine = new GameEngine();
    engine.startMatch(9);
    const wrongTurn = 1 - engine.getState().currentPlayerIndex;

    expect(
      engine.playAction(wrongTurn, { type: "play-card", cardId: "x" }).success,
    ).toBe(false);
    expect(
      engine.playAction(engine.getState().currentPlayerIndex, {
        type: "whatever",
      }).success,
    ).toBe(false);
  });

  // Scenario: offers explicit marriage announce action by suit
  // Feature: Hand Flow and Resolution (FR-MRG-009)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-001, FR-MRG-002, FR-MRG-005, FR-MRG-009
  it("offers explicit marriage announce action by suit", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(10);
    const leader = state.currentPlayerIndex;
    state.players[leader].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
      new Card("eichel", "ass"),
    ];
    state.currentTrick.cards = [];
    state.atoutSuit = "herz";

    const actions = engine.getLegalActions(leader);
    const marriage = actions.find(
      (action) => action.type === "announce-marriage" && action.suit === "herz",
    );
    expect(marriage).toBeDefined();
    expect(marriage.points).toBe(40);
  });

  // Scenario: two marriages require two separate leads with trick win in between
  // Feature: Hand Flow and Resolution (FR-MRG-013)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-009, FR-MRG-011, FR-MRG-013, FR-MRG-014
  it("allows scoring two marriages in one hand only across two leads", () => {
    const engine = new GameEngine({ deckVariant: "24-card" });
    const state = engine.startMatch(61);
    const leader = state.currentPlayerIndex;
    const follower = 1 - leader;

    state.talon = [];
    state.talonClosed = false;
    state.atoutSuit = "blatt";
    state.currentTrick.cards = [];
    state.players[leader].wonTrickCount = 0;
    state.players[leader].deferredMarriagePoints = 0;
    state.players[leader].appliedMarriagePoints = 0;
    state.players[leader].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
      new Card("eichel", "könig"),
      new Card("eichel", "ober"),
    ];
    state.players[follower].hand = [
      new Card("herz", "9"),
      new Card("eichel", "9"),
      new Card("schellen", "ass"),
      new Card("schellen", "10"),
    ];

    const openingActions = engine.getLegalActions(leader);
    expect(
      openingActions.filter((action) => action.type === "announce-marriage")
        .length,
    ).toBe(2);

    expect(
      engine.playAction(leader, {
        type: "announce-marriage",
        suit: "herz",
      }).success,
    ).toBe(true);

    const pendingActions = engine.getLegalActions(leader);
    expect(
      pendingActions.some(
        (action) =>
          action.type === "announce-marriage" && action.suit === "eichel",
      ),
    ).toBe(false);

    expect(
      engine.playAction(leader, {
        type: "play-card",
        cardId: "herz:könig",
      }).success,
    ).toBe(true);
    expect(
      engine.playAction(follower, {
        type: "play-card",
        cardId: "herz:9",
      }).success,
    ).toBe(true);

    expect(state.currentPlayerIndex).toBe(leader);
    expect(state.players[leader].appliedMarriagePoints).toBe(20);

    const secondLeadActions = engine.getLegalActions(leader);
    expect(
      secondLeadActions.some(
        (action) =>
          action.type === "announce-marriage" && action.suit === "eichel",
      ),
    ).toBe(true);

    expect(
      engine.playAction(leader, {
        type: "announce-marriage",
        suit: "eichel",
      }).success,
    ).toBe(true);
    expect(state.players[leader].appliedMarriagePoints).toBe(40);

    expect(
      engine.playAction(leader, {
        type: "play-card",
        cardId: "eichel:könig",
      }).success,
    ).toBe(true);
    expect(
      engine.playAction(follower, {
        type: "play-card",
        cardId: "eichel:9",
      }).success,
    ).toBe(true);
  });

  // Scenario: applies deferred marriage points when first trick is won
  // Feature: Hand Flow and Resolution (FR-MRG-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-006, FR-MRG-008, FR-MRG-011
  it("applies deferred marriage points when first trick is won", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(11);
    const leader = state.currentPlayerIndex;
    const follower = 1 - leader;

    state.players[leader].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
    ];
    state.players[follower].hand = [new Card("blatt", "unter")];
    state.players[leader].wonTrickCount = 0;
    state.players[leader].deferredMarriagePoints = 0;
    state.currentTrick.cards = [];
    state.atoutSuit = "herz";
    state.talon = [];

    expect(
      engine.playAction(leader, {
        type: "announce-marriage",
        suit: "herz",
      }).success,
    ).toBe(true);

    expect(
      engine.playAction(leader, {
        type: "play-card",
        cardId: "herz:könig",
      }).success,
    ).toBe(true);
    expect(state.players[leader].deferredMarriagePoints).toBe(40);

    expect(
      engine.playAction(follower, { type: "play-card", cardId: "blatt:unter" })
        .success,
    ).toBe(true);
    expect(state.players[leader].appliedMarriagePoints).toBe(40);
    expect(state.players[leader].deferredMarriagePoints).toBe(0);
  });

  // Scenario: handles talon close failure with fixed penalty scoring path
  // Feature: Hand Flow and Resolution (FR-END-008)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-008, FR-TAL-005
  it("handles talon close failure scoring path", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(12);
    const closer = state.currentPlayerIndex;
    state.talonClosedBy = closer;
    state.players[closer].trickPoints = 20;
    state.players[closer].wonTrickCount = 1;
    state.players[1 - closer].wonTrickCount = 1;
    state.leaderIndex = 1 - closer;

    engine.finishHandByPoints();

    expect(state.phase).toMatch(/hand-over|match-over/);
    expect(state.handHistory.length).toBeGreaterThan(0);
    expect(state.handHistory.at(-1).winnerIndex).toBe(1 - closer);
    expect(state.handHistory.at(-1).gamePoints).toBe(2);
  });

  // Scenario: handles talon close success path by 66
  // Feature: Hand Flow and Resolution (FR-END-008)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-008, FR-TAL-005
  it("handles talon close success path", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(13);
    const closer = state.currentPlayerIndex;
    state.talonClosedBy = closer;
    state.players[closer].trickPoints = 66;
    state.players[1 - closer].wonTrickCount = 1;

    engine.finishHandByPoints();
    expect(state.handHistory.at(-1).winnerIndex).toBe(closer);
  });

  // Scenario: closed talon still fails when closer misses 66 despite last trick
  // Feature: Hand Flow and Resolution (FR-END-008)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-008, FR-TAL-005
  it("does not allow closed talon success by last trick only", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(41);
    const closer = state.currentPlayerIndex;
    state.talonClosedBy = closer;
    state.players[closer].trickPoints = 40;
    state.players[closer].wonTrickCount = 1;
    state.leaderIndex = closer;

    engine.finishHandByPoints();
    expect(state.handHistory.at(-1).winnerIndex).toBe(1 - closer);
    expect(state.handHistory.at(-1).winnerReason).toBe("closed-talon-failed");
  });

  // Scenario: resolves hand by final trick when no one declares 66
  // Feature: Hand Flow and Resolution (FR-END-002)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-002, FR-END-003, FR-END-004
  it("finishes by final trick path with fixed one-point last-trick win", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(36);
    const leader = state.currentPlayerIndex;
    const follower = 1 - leader;

    state.talon = [];
    state.talonClosed = false;
    state.players[leader].hand = [new Card("blatt", "ass")];
    state.players[follower].hand = [new Card("blatt", "unter")];
    state.players[leader].trickPoints = 0;
    state.players[follower].trickPoints = 60;
    state.players[leader].wonTrickCount = 0;
    state.players[follower].wonTrickCount = 1;
    state.currentTrick.cards = [];

    expect(
      engine.playAction(leader, { type: "play-card", cardId: "blatt:ass" })
        .success,
    ).toBe(true);
    expect(
      engine.playAction(follower, { type: "play-card", cardId: "blatt:unter" })
        .success,
    ).toBe(true);

    expect(state.phase).toMatch(/hand-over|match-over/);
    expect(state.winnerReason).toBe("final-trick");
    expect(state.players[leader].trickPoints).toBe(13);
    expect(state.players[follower].trickPoints).toBe(60);
    expect(state.handHistory.at(-1).winnerIndex).toBe(leader);
    expect(state.handHistory.at(-1).gamePoints).toBe(1);
    expect(state.handHistory.at(-1).points).toEqual([
      state.players[0].trickPoints + state.players[0].appliedMarriagePoints,
      state.players[1].trickPoints + state.players[1].appliedMarriagePoints,
    ]);
  });

  // Scenario: promotes to match-over when target is reached
  // Feature: Hand Flow and Resolution (FR-MAT-002)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MAT-002
  it("promotes to match-over when target is reached", () => {
    const engine = new GameEngine({ matchTarget: 1 });
    const state = engine.startMatch(14);
    const winner = state.currentPlayerIndex;

    engine.finishHand(winner, "declared-66");
    expect(state.phase).toBe("match-over");
    expect(state.matchWinner).toBe(winner);
  });

  // Scenario: accumulates game points across hands and records outcomes
  // Feature: Hand Flow and Resolution (FR-MAT-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MAT-001
  it("accumulates game points across multiple finished hands", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(37);

    engine.finishHand(0, "declared-66");
    const afterFirst = state.players[0].gamePoints;
    expect(afterFirst).toBeGreaterThan(0);

    state.phase = "playing";
    state.handNumber += 1;
    engine.finishHand(0, "declared-66");

    expect(state.players[0].gamePoints).toBeGreaterThan(afterFirst);
    expect(state.handHistory).toHaveLength(2);
  });

  // Scenario: stores hand history summary and final match winner
  // Feature: Hand Flow and Resolution (FR-MAT-003)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MAT-002, FR-MAT-003
  it("stores per-hand summary and final match winner", () => {
    const engine = new GameEngine({ matchTarget: 1 });
    const state = engine.startMatch(38);
    const winner = state.currentPlayerIndex;

    engine.finishHand(winner, "declared-66");

    expect(state.phase).toBe("match-over");
    expect(state.matchWinner).toBe(winner);
    expect(state.handHistory).toHaveLength(1);
    expect(state.handHistory[0]).toMatchObject({
      handNumber: 1,
      winnerIndex: winner,
      winnerReason: "declared-66",
    });
    expect(state.handHistory[0].points).toHaveLength(2);
  });

  // Scenario: wrong declare-66 loses hand with two game points penalty
  // Feature: Hand Flow and Resolution (FR-END-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-001, NFR-REL-002
  it("penalizes wrong declare-66 with two game points", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(18);
    const active = state.currentPlayerIndex;
    state.players[active].wonTrickCount = 1;
    const result = engine.playAction(active, { type: "declare-66" });
    const opponent = 1 - active;

    expect(result.success).toBe(true);
    expect(state.phase).toMatch(/hand-over|match-over/);
    expect(state.handHistory.at(-1).winnerIndex).toBe(opponent);
    expect(state.handHistory.at(-1).winnerReason).toBe("declared-66-failed");
    expect(state.handHistory.at(-1).gamePoints).toBe(2);
  });

  // Scenario: wrong declare-66 gives three points when claimant has no trick
  // Feature: Hand Flow and Resolution (FR-END-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-001, FR-END-007
  it("penalizes wrong declare-66 with three game points when Schwarz", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(42);
    const active = state.currentPlayerIndex;
    state.players[active].wonTrickCount = 0;

    const result = engine.playAction(active, { type: "declare-66" });
    const opponent = 1 - active;

    expect(result.success).toBe(true);
    expect(state.handHistory.at(-1).winnerIndex).toBe(opponent);
    expect(state.handHistory.at(-1).gamePoints).toBe(3);
  });

  // Scenario: applies marriage points immediately when player already won a trick
  // Feature: Hand Flow and Resolution (FR-MRG-007)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-007
  it("applies marriage points immediately when player already won a trick", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(19);
    const active = state.currentPlayerIndex;
    state.players[active].wonTrickCount = 1;
    state.players[active].hand = [
      new Card("blatt", "könig"),
      new Card("blatt", "ober"),
    ];
    state.currentTrick.cards = [];
    state.atoutSuit = "herz";

    const announce = engine.playAction(active, {
      type: "announce-marriage",
      suit: "blatt",
    });
    expect(announce.success).toBe(true);
    expect(state.players[active].appliedMarriagePoints).toBe(20);
    expect(state.players[active].deferredMarriagePoints).toBe(0);

    const result = engine.playAction(active, {
      type: "play-card",
      cardId: "blatt:könig",
    });

    expect(result.success).toBe(true);
    expect(state.players[active].appliedMarriagePoints).toBe(20);
  });

  // Scenario: allows immediate declare-66 after marriage announce with prior trick
  // Feature: Hand Flow and Resolution (FR-END-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-007, FR-END-001, FR-END-009
  it("allows declare-66 right after marriage announcement when points become sufficient", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(47);
    const leader = state.currentPlayerIndex;

    state.players[leader].wonTrickCount = 1;
    state.players[leader].trickPoints = 47;
    state.players[leader].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
    ];
    state.currentTrick.cards = [];
    state.atoutSuit = "blatt";

    expect(
      engine.playAction(leader, {
        type: "announce-marriage",
        suit: "herz",
      }).success,
    ).toBe(true);
    expect(state.players[leader].appliedMarriagePoints).toBe(20);

    const legal = engine.getLegalActions(leader);
    expect(legal.some((action) => action.type === "declare-66")).toBe(true);

    const declareResult = engine.playAction(leader, { type: "declare-66" });
    expect(declareResult.success).toBe(true);
    expect(state.phase).toMatch(/hand-over|match-over/);
    expect(state.handHistory.at(-1).winnerIndex).toBe(leader);
    expect(state.handHistory.at(-1).winnerReason).toBe("declared-66");
  });

  // Scenario: supports swap then close then Atout marriage then declare-66
  // Feature: Hand Flow and Resolution (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006, FR-TAL-001, FR-MRG-007, FR-END-001
  it("allows ordered sequence swap-close-marriage-declare66 on lead", () => {
    const engine = new GameEngine({ deckVariant: "24-card" });
    const state = engine.startMatch(59);
    const leader = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("blatt", "ass"),
      new Card("herz", "unter"),
      new Card("eichel", "ober"),
    ];
    state.atoutSuit = "eichel";
    state.atoutCard = state.talon.at(-1);
    state.players[leader].wonTrickCount = 1;
    state.players[leader].trickPoints = 27;
    state.players[leader].hand = [
      new Card("eichel", "könig"),
      new Card("eichel", "9"),
      new Card("schellen", "ass"),
    ];

    expect(engine.playAction(leader, { type: "swap-atout" }).success).toBe(
      true,
    );
    expect(engine.playAction(leader, { type: "close-talon" }).success).toBe(
      true,
    );
    expect(
      engine.playAction(leader, { type: "announce-marriage", suit: "eichel" })
        .success,
    ).toBe(true);
    expect(state.players[leader].appliedMarriagePoints).toBe(40);
    expect(engine.getCurrentPoints(leader)).toBeGreaterThanOrEqual(66);

    expect(engine.playAction(leader, { type: "declare-66" }).success).toBe(
      true,
    );
    expect(state.phase).toMatch(/hand-over|match-over/);
    expect(state.handHistory.at(-1).winnerIndex).toBe(leader);
    expect(state.handHistory.at(-1).winnerReason).toBe("declared-66");
  });

  // Scenario: close talon remains legal after marriage announcement is pending
  // Feature: Hand Flow and Resolution (FR-TAL-002)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-002, FR-MRG-009, FR-END-009
  it("allows close-talon after marriage announce and keeps pending marriage intent", () => {
    const engine = new GameEngine({ deckVariant: "24-card" });
    const state = engine.startMatch(60);
    const leader = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("blatt", "ass"),
      new Card("herz", "unter"),
      new Card("eichel", "ober"),
    ];
    state.atoutSuit = "eichel";
    state.atoutCard = state.talon.at(-1);
    state.players[leader].wonTrickCount = 1;
    state.players[leader].trickPoints = 27;
    state.players[leader].hand = [
      new Card("eichel", "könig"),
      new Card("eichel", "9"),
      new Card("schellen", "ass"),
    ];

    expect(engine.playAction(leader, { type: "swap-atout" }).success).toBe(
      true,
    );
    expect(
      engine.playAction(leader, { type: "announce-marriage", suit: "eichel" })
        .success,
    ).toBe(true);

    const beforeClose = engine.getLegalActions(leader);
    expect(beforeClose.some((action) => action.type === "close-talon")).toBe(
      true,
    );

    expect(engine.playAction(leader, { type: "close-talon" }).success).toBe(
      true,
    );
    expect(state.talonClosed).toBe(true);
    expect(state.pendingMarriageIntent?.suit).toBe("eichel");

    const legalAfterClose = engine.getLegalActions(leader);
    expect(legalAfterClose.some((action) => action.type === "declare-66")).toBe(
      true,
    );
    expect(
      legalAfterClose.some(
        (action) =>
          action.type === "play-card" &&
          (action.cardId === "eichel:könig" || action.cardId === "eichel:ober"),
      ),
    ).toBe(true);
  });

  // Scenario: no marriage points are awarded without explicit announcement
  // Feature: Hand Flow and Resolution (FR-MRG-010)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MRG-010
  it("does not score marriage if player skips announcement", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(34);
    const leader = state.currentPlayerIndex;
    const follower = 1 - leader;

    state.players[leader].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
    ];
    state.players[follower].hand = [new Card("blatt", "unter")];
    state.currentTrick.cards = [];
    state.atoutSuit = "herz";
    state.talon = [];

    expect(
      engine.playAction(leader, {
        type: "play-card",
        cardId: "herz:könig",
      }).success,
    ).toBe(true);
    expect(
      engine.playAction(follower, {
        type: "play-card",
        cardId: "blatt:unter",
      }).success,
    ).toBe(true);
    expect(state.players[leader].appliedMarriagePoints).toBe(0);
    expect(state.players[leader].deferredMarriagePoints).toBe(0);
  });

  // Scenario: accepts declare-66 via playAction when threshold is met
  // Feature: Hand Flow and Resolution (FR-END-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-001
  it("accepts declare-66 via playAction when threshold is met", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(21);
    const active = state.currentPlayerIndex;
    state.players[active].trickPoints = 66;

    const result = engine.playAction(active, { type: "declare-66" });
    expect(result.success).toBe(true);
    expect(state.phase).toMatch(/hand-over|match-over/);
  });

  // Scenario: rejects declare-66 when not on lead
  // Feature: Hand Flow and Resolution (FR-END-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-001, NFR-REL-002
  it("rejects declare-66 when not on lead", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(43);
    const active = state.currentPlayerIndex;

    state.players[active].trickPoints = 70;
    state.currentTrick.cards = [
      { playerIndex: active, card: state.players[active].hand[0] },
    ];

    const result = engine.playAction(active, { type: "declare-66" });
    expect(result.success).toBe(false);
  });

  // Scenario: rejects close-talon when not legal
  // Feature: Hand Flow and Resolution (FR-TAL-002)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-002, NFR-REL-002
  it("rejects close-talon when not legal", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(22);
    const active = state.currentPlayerIndex;
    state.currentTrick.cards = [
      { playerIndex: active, card: state.players[active].hand[0] },
    ];

    const result = engine.playAction(active, { type: "close-talon" });
    expect(result.success).toBe(false);
  });

  // Scenario: returns no legal actions for wrong turn or non-playing phase
  // Feature: Hand Flow and Resolution (FR-END-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-001, NFR-REL-002
  it("returns no legal actions for wrong turn or non-playing phase", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(25);
    const active = state.currentPlayerIndex;

    expect(engine.getLegalActions(1 - active)).toEqual([]);

    state.phase = "hand-over";
    expect(engine.getLegalActions(active)).toEqual([]);
  });

  // Scenario: offers declare-66 in legal actions on lead regardless of points
  // Feature: Hand Flow and Resolution (FR-END-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-END-001
  it("offers declare-66 in legal actions on lead regardless of points", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(26);
    const active = state.currentPlayerIndex;
    state.players[active].trickPoints = 10;

    const actions = engine.getLegalActions(active);
    expect(actions[0]).toEqual({ type: "declare-66" });
  });

  // Scenario: offers and executes Atout swap in 24-card mode
  // Feature: Hand Flow and Resolution (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("offers and executes Atout swap in 24-card mode", () => {
    const engine = new GameEngine({ deckVariant: "24-card" });
    const state = engine.startMatch(31);
    const active = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("eichel", "ass"),
      new Card("blatt", "unter"),
      new Card("herz", "könig"),
    ];
    state.atoutSuit = "herz";
    state.atoutCard = state.talon.at(-1);
    state.players[active].wonTrickCount = 1;
    state.players[active].hand = [
      new Card("herz", "9"),
      new Card("blatt", "ass"),
    ];

    const actions = engine.getLegalActions(active);
    expect(actions.some((action) => action.type === "swap-atout")).toBe(true);

    const result = engine.playAction(active, { type: "swap-atout" });
    expect(result.success).toBe(true);
    expect(state.atoutCard.id).toBe("herz:9");
    expect(state.talon.at(-1)?.id).toBe("herz:9");
    expect(
      state.players[active].hand.some((card) => card.id === "herz:könig"),
    ).toBe(true);
  });

  // Scenario: allows immediate Atout swap on opening lead in 24-card mode
  // Feature: Hand Flow and Resolution (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("allows opening-lead swap with 9 as lowest Atout in 24-card mode", () => {
    const engine = new GameEngine({ deckVariant: "24-card" });
    const state = engine.startMatch(58);
    const active = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("eichel", "ass"),
      new Card("schellen", "ober"),
      new Card("blatt", "10"),
    ];
    state.atoutSuit = "blatt";
    state.atoutCard = state.talon.at(-1);
    state.players[active].wonTrickCount = 0;
    state.players[active].hand = [
      new Card("blatt", "9"),
      new Card("herz", "ass"),
    ];

    const actions = engine.getLegalActions(active);
    expect(actions.some((action) => action.type === "swap-atout")).toBe(true);

    const result = engine.playAction(active, { type: "swap-atout" });
    expect(result.success).toBe(true);
    expect(state.atoutCard.id).toBe("blatt:9");
  });

  // Scenario: keeps swapped Atout stable after next trick draw
  // Feature: Hand Flow and Resolution (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006, NFR-REL-003
  it("does not duplicate open Atout card after swap and next trick", () => {
    const engine = new GameEngine({ deckVariant: "24-card" });
    const state = engine.startMatch(46);
    const leader = state.currentPlayerIndex;
    const follower = 1 - leader;

    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.atoutSuit = "herz";
    state.talon = [
      new Card("eichel", "unter"),
      new Card("blatt", "unter"),
      new Card("herz", "könig"),
    ];
    state.atoutCard = state.talon.at(-1);
    state.players[leader].wonTrickCount = 1;
    state.players[leader].hand = [
      new Card("herz", "9"),
      new Card("blatt", "ass"),
    ];
    state.players[follower].hand = [new Card("blatt", "ober")];

    expect(engine.playAction(leader, { type: "swap-atout" }).success).toBe(
      true,
    );
    expect(state.atoutCard.id).toBe("herz:9");
    expect(state.talon.at(-1)?.id).toBe("herz:9");

    expect(
      engine.playAction(leader, { type: "play-card", cardId: "blatt:ass" })
        .success,
    ).toBe(true);
    expect(
      engine.playAction(follower, {
        type: "play-card",
        cardId: "blatt:ober",
      }).success,
    ).toBe(true);

    engine.finalizeTrickReveal();

    expect(state.atoutCard?.id).toBe("herz:9");
    const oldAtoutOccurrences = [0, 1]
      .flatMap((index) => state.players[index].hand)
      .filter((card) => card.id === "herz:könig").length;
    expect(oldAtoutOccurrences).toBe(1);
  });

  // Scenario: allows Atout swap with Unter in 20-card mode
  // Feature: Hand Flow and Resolution (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("allows Atout swap with Unter in 20-card mode", () => {
    const engine = new GameEngine({ deckVariant: "20-card" });
    const state = engine.startMatch(32);
    const active = state.currentPlayerIndex;

    state.deckVariant = "20-card";
    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("eichel", "ass"),
      new Card("blatt", "unter"),
      new Card("herz", "könig"),
    ];
    state.atoutSuit = "herz";
    state.atoutCard = state.talon.at(-1);
    state.players[active].wonTrickCount = 1;
    state.players[active].hand = [
      new Card("herz", "unter"),
      new Card("blatt", "ass"),
    ];

    const result = engine.playAction(active, { type: "swap-atout" });
    expect(result.success).toBe(true);
    expect(state.atoutCard.id).toBe("herz:unter");
  });

  // Scenario: rejects Atout swap when fewer than two face-down talon cards remain
  // Feature: Hand Flow and Resolution (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("rejects Atout swap when talon has one face-down card left", () => {
    const engine = new GameEngine({ deckVariant: "24-card" });
    const state = engine.startMatch(48);
    const active = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [new Card("herz", "könig"), new Card("herz", "ober")];
    state.atoutSuit = "herz";
    state.atoutCard = state.talon.at(-1);
    state.players[active].wonTrickCount = 1;
    state.players[active].hand = [new Card("herz", "9")];

    const result = engine.playAction(active, { type: "swap-atout" });
    expect(result.success).toBe(false);
  });

  // Scenario: allows Atout swap before first trick win in 20-card mode
  // Feature: Hand Flow and Resolution (FR-TAL-006)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-006
  it("allows Atout swap when 20-card leader has no won trick", () => {
    const engine = new GameEngine({ deckVariant: "20-card" });
    const state = engine.startMatch(49);
    const active = state.currentPlayerIndex;

    state.deckVariant = "20-card";
    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [
      new Card("eichel", "ass"),
      new Card("blatt", "unter"),
      new Card("herz", "könig"),
    ];
    state.atoutSuit = "herz";
    state.atoutCard = state.talon.at(-1);
    state.players[active].wonTrickCount = 0;
    state.players[active].hand = [new Card("herz", "unter")];

    const result = engine.playAction(active, { type: "swap-atout" });
    expect(result.success).toBe(true);
  });

  // Scenario: rejects Atout swap when talon is closed
  // Feature: Hand Flow and Resolution (FR-TAL-007)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-TAL-007
  it("rejects Atout swap when talon is closed", () => {
    const engine = new GameEngine();
    const state = engine.startMatch(33);
    const active = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.talonClosed = true;
    state.talon = [new Card("eichel", "ass")];
    state.atoutSuit = "herz";
    state.atoutCard = new Card("herz", "könig");
    state.players[active].hand = [new Card("herz", "9")];

    const result = engine.playAction(active, { type: "swap-atout" });
    expect(result.success).toBe(false);
  });
});
