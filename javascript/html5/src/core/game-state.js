import { normalizeSettings } from "../config/configuration.js";

export function createPlayerState(index, settingsPlayer) {
  const seat = index === 0 ? "south" : "north";
  return {
    id: `player_${seat}`,
    seat,
    name: settingsPlayer.name,
    type: settingsPlayer.type,
    aiLevel: settingsPlayer.aiLevel,
    hand: [],
    trickPoints: 0,
    gamePoints: 0,
    wonTrickCount: 0,
    wonCards: [],
    deferredMarriagePoints: 0,
    appliedMarriagePoints: 0,
  };
}

export function createMatchState(settings) {
  const normalized = normalizeSettings(settings);
  return {
    settings: normalized,
    phase: "setup",
    players: normalized.players.map((player, index) =>
      createPlayerState(index, player),
    ),
    dealerIndex: 0,
    leaderIndex: 1,
    currentPlayerIndex: 1,
    currentTrick: {
      leaderIndex: 1,
      cards: [],
    },
    talon: [],
    atoutCard: null,
    atoutSuit: null,
    talonClosed: false,
    talonClosedBy: null,
    handNumber: 0,
    handHistory: [],
    matchWinner: null,
    statusMessage: "Bereit für einen neuen Bummerl.",
    winnerReason: null,
    pendingAnnouncement: null,
    pendingMarriageIntent: null,
    pendingTrickDraw: null,
    deckVariant: normalized.deckVariant,
  };
}
