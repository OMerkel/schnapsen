import { describe, expect, it } from "vitest";
import {
  getDefaultSettings,
  mergeSettings,
  normalizeSettings,
} from "../config/configuration.js";
import { formatCardName, STATUS_MESSAGES } from "../config/messages.js";
import { Card } from "../core/card.js";

describe("Configuration and messages", () => {
  // Scenario: normalizes invalid settings to defaults
  // Feature: Configuration and Messaging (FR-OPT-003)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPT-003, FR-OPT-010
  it("normalizes invalid settings to defaults", () => {
    const settings = normalizeSettings({
      deckVariant: "unknown",
      matchTarget: -1,
      players: [{ type: "x", aiLevel: "zzz" }, {}],
    });

    expect(settings.deckVariant).toBe("24-card");
    expect(settings.matchTarget).toBe(7);
    expect(settings.players[0].type).toBe("human");
    expect(settings.players[1].name).toBe("player_north");
  });

  // Scenario: merges patch settings and keeps normalization
  // Feature: Configuration and Messaging (FR-OPT-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-OPT-004, FR-OPT-007, FR-OPT-009
  it("merges patch settings and keeps normalization", () => {
    const merged = mergeSettings(getDefaultSettings(), {
      deckVariant: "20-card",
      players: [
        { type: "ai", aiLevel: "hard", name: "Bot" },
        { type: "human", aiLevel: "easy", name: "You" },
      ],
    });

    expect(merged.deckVariant).toBe("20-card");
    expect(merged.players[0].type).toBe("ai");
    expect(merged.players[0].aiLevel).toBe("hard");
  });

  // Scenario: formats card and status messages
  // Feature: Configuration and Messaging (FR-MAT-004)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: FR-MAT-004, FR-UIR-004
  it("formats card and status messages", () => {
    const card = new Card("schellen", "könig");
    expect(formatCardName(card)).toBe("König von Schellen");
    expect(STATUS_MESSAGES.matchWon("Anna")).toContain("Anna");
    expect(STATUS_MESSAGES.handWon("Anna", 2)).toContain("2 Spielpunkte");
    expect(STATUS_MESSAGES.declare66("Anna")).toContain("66");
  });
});
