import { describe, expect, it } from "vitest";
import { STATE_SCHEMA_VERSION } from "../config/constants.js";
import { Card } from "../core/card.js";
import { GameEngine } from "../core/game-engine.js";
import { PersistenceManager } from "../persistence/persistence-manager.js";

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

function createVersionedStorage(rawMap) {
  return {
    getItem: (key) => (rawMap.has(key) ? rawMap.get(key) : null),
    setItem: (key, value) => {
      rawMap.set(key, value);
    },
    removeItem: (key) => {
      rawMap.delete(key);
    },
  };
}

describe("Persistence", () => {
  // Scenario: saves and loads normalized settings
  // Feature: Persistence and Resume (FR-PRS-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-PRS-001
  it("saves and loads normalized settings", () => {
    const storage = createMemoryStorage();
    const persistence = new PersistenceManager(storage);
    persistence.saveSettings({
      deckVariant: "20-card",
      matchTarget: 11,
      players: [{ type: "human" }, { type: "ai", aiLevel: "hard" }],
    });
    const settings = persistence.loadSettings();
    expect(settings.deckVariant).toBe("20-card");
    expect(settings.players[1].type).toBe("ai");
  });

  // Scenario: round-trips game state with card revival
  // Feature: Persistence and Resume (FR-PRS-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-PRS-001, FR-PRS-002
  it("round-trips game state with card revival", () => {
    const storage = createMemoryStorage();
    const persistence = new PersistenceManager(storage);
    const engine = new GameEngine();
    engine.startMatch(7);
    persistence.saveState(engine.getState());
    const loaded = persistence.loadState();
    expect(loaded.players[0].hand[0].id).toContain(":");
    expect(typeof loaded.players[0].hand[0].equals).toBe("function");
  });

  // Scenario: serializes and revives cards in current trick entries
  // Feature: Persistence and Resume (FR-PRS-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-PRS-001, FR-PRS-002
  it("serializes and revives cards in current trick entries", () => {
    const storage = createMemoryStorage();
    const persistence = new PersistenceManager(storage);
    const engine = new GameEngine();
    const state = engine.startMatch(27);

    state.currentTrick.cards = [
      { playerIndex: 0, card: new Card("eichel", "ass") },
    ];
    persistence.saveState(state);

    const loaded = persistence.loadState();
    expect(loaded.currentTrick.cards).toHaveLength(1);
    expect(loaded.currentTrick.cards[0].card.id).toBe("eichel:ass");
    expect(typeof loaded.currentTrick.cards[0].card.equals).toBe("function");
  });

  // Scenario: clears persisted state
  // Feature: Persistence and Resume (FR-PRS-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-PRS-001
  it("clears persisted state", () => {
    const storage = createMemoryStorage();
    const persistence = new PersistenceManager(storage);
    const engine = new GameEngine();
    engine.startMatch(8);
    persistence.saveState(engine.getState());
    persistence.clearState();
    expect(persistence.loadState()).toBeNull();
  });

  // Scenario: returns null for incompatible saved versions
  // Feature: Persistence and Resume (FR-PRS-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-PRS-004
  it("returns null for incompatible saved versions", () => {
    const rawMap = new Map();
    rawMap.set(
      "schnapsen.settings",
      JSON.stringify({ version: 999, settings: {} }),
    );
    rawMap.set("schnapsen.state", JSON.stringify({ version: 999, state: {} }));
    const persistence = new PersistenceManager(createVersionedStorage(rawMap));

    expect(persistence.loadSettings()).toBeNull();
    expect(persistence.loadState()).toBeNull();
  });

  // Scenario: does not throw without storage backend
  // Feature: Persistence and Resume (NFR-REL-003)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: NFR-REL-003
  it("does not throw without storage backend", () => {
    const persistence = new PersistenceManager(null);
    expect(() => persistence.saveSettings({})).not.toThrow();
    expect(() =>
      persistence.saveState({
        players: [],
        talon: [],
        currentTrick: { cards: [] },
      }),
    ).not.toThrow();
    expect(persistence.loadSettings()).toBeNull();
    expect(persistence.loadState()).toBeNull();
    expect(() => persistence.clearState()).not.toThrow();
  });

  // Scenario: revives state with optional arrays omitted via safe defaults
  // Feature: Persistence and Resume (FR-PRS-002)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-PRS-001, FR-PRS-002
  it("defaults missing hand, wonCards and talon arrays during load", () => {
    const rawMap = new Map();
    rawMap.set(
      "schnapsen.state",
      JSON.stringify({
        version: STATE_SCHEMA_VERSION,
        state: {
          players: [
            { id: "player_south", hand: undefined, wonCards: undefined },
            { id: "player_north" },
          ],
          currentTrick: { cards: [] },
          atoutCard: null,
        },
      }),
    );

    const persistence = new PersistenceManager(createVersionedStorage(rawMap));
    const loaded = persistence.loadState();

    expect(loaded.players[0].hand).toEqual([]);
    expect(loaded.players[0].wonCards).toEqual([]);
    expect(loaded.players[1].hand).toEqual([]);
    expect(loaded.players[1].wonCards).toEqual([]);
    expect(loaded.talon).toEqual([]);
    expect(loaded.atoutCard).toBeNull();
  });
});
