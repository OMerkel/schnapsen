import { describe, expect, it } from "vitest";
import manifest from "../manifest.json";

describe("PWA config", () => {
  // Scenario: uses schnapsen metadata
  // Feature: PWA Configuration (NFR-PWA-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: NFR-PWA-001
  it("uses schnapsen metadata", () => {
    expect(manifest.name).toBe("Schnapsen");
    expect(manifest.short_name).toBe("Schnapsen");
    expect(manifest.start_url).toBe("./index.html");
  });

  // Scenario: provides install icons
  // Feature: PWA Configuration (NFR-PWA-001)
  // Given the relevant domain preconditions are prepared
  // When the operation under test is executed
  // Then the expected rule outcome is observed
  // And the resulting state remains consistent
  // Req IDs: NFR-PWA-001
  it("provides install icons", () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(5);
    for (const icon of manifest.icons) {
      expect(icon.src).toContain("Schnapsen");
    }
  });
});
