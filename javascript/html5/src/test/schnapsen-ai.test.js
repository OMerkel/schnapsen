import { describe, expect, it } from "vitest";
import { getAIMove } from "../ai/ai-manager.js";
import { Card } from "../core/card.js";
import { GameEngine } from "../core/game-engine.js";

describe("AI manager", () => {
  // Scenario: returns legal action for current AI player
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001, FR-AI-002
  it("returns legal action for current AI player", () => {
    const engine = new GameEngine({
      players: [
        { type: "ai", aiLevel: "easy", name: "AI 1" },
        { type: "human", aiLevel: "easy", name: "Player" },
      ],
    });
    engine.startMatch(5);
    const state = engine.getState();
    const move = getAIMove(state, state.currentPlayerIndex, "easy");
    expect(move).not.toBeNull();

    const legal = engine.getLegalActions(state.currentPlayerIndex);
    const isLegal = legal.some(
      (action) =>
        action.type === move.type &&
        (action.cardId ? action.cardId === move.cardId : true),
    );
    expect(isLegal).toBe(true);
  });

  // Scenario: declares 66 when threshold reached on lead
  // Feature: AI Behavior and Legality (FR-AI-005)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-005, FR-END-001
  it("declares 66 when threshold reached on lead", () => {
    const engine = new GameEngine();
    engine.startMatch(6);
    const state = engine.getState();
    const player = state.currentPlayerIndex;
    state.players[player].trickPoints = 66;
    const move = getAIMove(state, player, "hard");
    expect(move).toEqual({ type: "declare-66" });
  });

  // Scenario: does not declare 66 when not on lead
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001, FR-END-001
  it("does not declare 66 when not on lead", () => {
    const engine = new GameEngine();
    engine.startMatch(44);
    const state = engine.getState();
    const player = state.currentPlayerIndex;
    state.players[player].trickPoints = 70;
    state.currentTrick.cards = [
      { playerIndex: player, card: state.players[player].hand[0] },
    ];

    const move = getAIMove(state, player, "hard");
    expect(move).not.toEqual({ type: "declare-66" });
  });

  // Scenario: returns null outside playing phase or wrong turn
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001
  it("returns null outside playing phase or wrong turn", () => {
    const engine = new GameEngine();
    engine.startMatch(15);
    const state = engine.getState();
    state.phase = "hand-over";
    expect(getAIMove(state, state.currentPlayerIndex, "easy")).toBeNull();
  });

  // Scenario: hard AI can choose close talon on strong lead
  // Feature: AI Behavior and Legality (FR-AI-005)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-005, FR-TAL-001, FR-TAL-002
  it("hard AI can choose close talon on strong lead", () => {
    const engine = new GameEngine();
    engine.startMatch(16);
    const state = engine.getState();
    const player = state.currentPlayerIndex;
    state.players[player].trickPoints = 50;
    state.currentTrick.cards = [];
    state.talonClosed = false;
    state.talon = [new Card("eichel", "9")];

    const move = getAIMove(state, player, "hard");
    expect(move).toEqual({ type: "close-talon" });
  });

  // Scenario: medium AI explicitly announces marriage when available
  // Feature: AI Behavior and Legality (FR-AI-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-004, FR-MRG-009
  it("medium AI explicitly announces marriage when available", () => {
    const engine = new GameEngine();
    engine.startMatch(17);
    const state = engine.getState();
    const player = state.currentPlayerIndex;
    state.currentTrick.cards = [];
    state.players[player].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
    ];
    state.atoutSuit = "herz";

    const move = getAIMove(state, player, "medium");
    expect(move.type).toBe("announce-marriage");
    expect(move.suit).toBe("herz");
  });

  // Scenario: AI follows pending marriage intent by playing matching card
  // Feature: AI Behavior and Legality (FR-AI-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-004, FR-MRG-011
  it("plays matching König or Ober after announcing marriage", () => {
    const engine = new GameEngine();
    engine.startMatch(35);
    const state = engine.getState();
    const player = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.players[player].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
      new Card("eichel", "9"),
    ];
    state.pendingMarriageIntent = {
      playerIndex: player,
      suit: "herz",
      points: 40,
    };

    const move = getAIMove(state, player, "hard");
    expect(move.type).toBe("play-card");
    expect(["herz:könig", "herz:ober"]).toContain(move.cardId);
  });

  // Scenario: returns null when pending marriage has no legal matching card
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001, FR-MRG-011
  it("returns null for pending marriage without matching legal card", () => {
    const engine = new GameEngine();
    engine.startMatch(39);
    const state = engine.getState();
    const player = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.players[player].hand = [new Card("blatt", "ass")];
    state.pendingMarriageIntent = {
      playerIndex: player,
      suit: "herz",
      points: 40,
    };

    const move = getAIMove(state, player, "hard");
    expect(move).toBeNull();
  });

  // Scenario: returns null when current player has no legal cards
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001, NFR-REL-003
  it("returns null when no legal cards exist", () => {
    const engine = new GameEngine();
    engine.startMatch(40);
    const state = engine.getState();
    const player = state.currentPlayerIndex;

    state.players[player].hand = [];
    state.currentTrick.cards = [];

    const move = getAIMove(state, player, "medium");
    expect(move).toBeNull();
  });

  // Scenario: evaluates follow-up trick play when one card is already on table
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001, FR-AI-003
  it("evaluates follow-up trick play when one card is already on table", () => {
    const engine = new GameEngine();
    engine.startMatch(20);
    const state = engine.getState();
    const player = state.currentPlayerIndex;
    const opponent = 1 - player;

    state.currentTrick.cards = [
      { playerIndex: opponent, card: state.players[opponent].hand[0] },
    ];
    const move = getAIMove(state, player, "easy");

    expect(move.type).toBe("play-card");
    expect(typeof move.cardId).toBe("string");
  });

  // Scenario: supports easy medium and hard level outputs as legal actions
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001, FR-AI-002
  it("supports easy medium and hard level outputs as legal actions", () => {
    const engine = new GameEngine();
    engine.startMatch(23);
    const state = engine.getState();
    const player = state.currentPlayerIndex;

    for (const level of ["easy", "medium", "hard"]) {
      const move = getAIMove(state, player, level);
      const legal = engine.getLegalActions(player);
      const isLegal = legal.some(
        (action) =>
          action.type === move.type &&
          (action.cardId ? action.cardId === move.cardId : true),
      );
      expect(isLegal).toBe(true);
    }
  });

  // Scenario: evaluates leader cards with marriage bonus path in easy mode
  // Feature: AI Behavior and Legality (FR-AI-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-AI-001, FR-AI-003
  it("evaluates leader cards with marriage bonus path in easy mode", () => {
    const engine = new GameEngine();
    engine.startMatch(24);
    const state = engine.getState();
    const player = state.currentPlayerIndex;

    state.currentTrick.cards = [];
    state.players[player].hand = [
      new Card("herz", "könig"),
      new Card("herz", "ober"),
      new Card("eichel", "9"),
    ];
    state.atoutSuit = "herz";

    const move = getAIMove(state, player, "easy");
    expect(move.type).toBe("play-card");
    expect(typeof move.cardId).toBe("string");
  });
});
