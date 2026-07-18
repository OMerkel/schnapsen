import {
  AI_LEVELS,
  DECK_VARIANTS,
  DEFAULT_SETTINGS,
  MATCH_TARGET_DEFAULT,
  PLAYER_TYPES,
} from "./constants.js";

function normalizePlayer(player, fallbackName) {
  const type = PLAYER_TYPES.includes(player?.type) ? player.type : "human";
  const aiLevel = AI_LEVELS.includes(player?.aiLevel) ? player.aiLevel : "easy";
  return {
    type,
    aiLevel,
    name: String(player?.name || fallbackName),
  };
}

export function normalizeSettings(settings = {}) {
  const deckVariant =
    settings.deckVariant === DECK_VARIANTS.twenty
      ? DECK_VARIANTS.twenty
      : DECK_VARIANTS.twentyFour;
  const matchTarget =
    Number.isInteger(settings.matchTarget) && settings.matchTarget > 0
      ? settings.matchTarget
      : MATCH_TARGET_DEFAULT;

  return {
    deckVariant,
    matchTarget,
    players: [
      normalizePlayer(settings.players?.[0], DEFAULT_SETTINGS.players[0].name),
      normalizePlayer(settings.players?.[1], DEFAULT_SETTINGS.players[1].name),
    ],
  };
}

export function mergeSettings(baseSettings, patch) {
  return normalizeSettings({
    ...baseSettings,
    ...patch,
    players: patch?.players || baseSettings.players,
  });
}

export function getDefaultSettings() {
  return normalizeSettings(DEFAULT_SETTINGS);
}
