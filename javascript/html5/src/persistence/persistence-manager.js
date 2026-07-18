import { normalizeSettings } from "../config/configuration.js";
import {
  SETTINGS_SCHEMA_VERSION,
  STATE_SCHEMA_VERSION,
} from "../config/constants.js";
import { Card } from "../core/card.js";

const SETTINGS_KEY = "schnapsen.settings";
const STATE_KEY = "schnapsen.state";

function serializeCards(cards) {
  return cards.map((card) => card.toJSON());
}

function reviveCards(cards) {
  return cards.map((card) => Card.from(card));
}

function serializePlayer(player) {
  return {
    ...player,
    hand: serializeCards(player.hand),
    wonCards: serializeCards(player.wonCards),
  };
}

function revivePlayer(player) {
  return {
    ...player,
    hand: reviveCards(player.hand || []),
    wonCards: reviveCards(player.wonCards || []),
  };
}

export class PersistenceManager {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }

  saveSettings(settings) {
    this.storage?.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        version: SETTINGS_SCHEMA_VERSION,
        settings: normalizeSettings(settings),
      }),
    );
  }

  loadSettings() {
    const raw = this.storage?.getItem(SETTINGS_KEY);
    if (!raw) {
      return null;
    }
    const payload = JSON.parse(raw);
    if (payload.version !== SETTINGS_SCHEMA_VERSION) {
      return null;
    }
    return normalizeSettings(payload.settings);
  }

  saveState(state) {
    const serializedState = {
      ...state,
      players: state.players.map(serializePlayer),
      talon: serializeCards(state.talon || []),
      atoutCard: state.atoutCard?.toJSON() || null,
      currentTrick: {
        ...state.currentTrick,
        cards: state.currentTrick.cards.map((entry) => ({
          ...entry,
          card: entry.card.toJSON(),
        })),
      },
    };

    this.storage?.setItem(
      STATE_KEY,
      JSON.stringify({ version: STATE_SCHEMA_VERSION, state: serializedState }),
    );
  }

  loadState() {
    const raw = this.storage?.getItem(STATE_KEY);
    if (!raw) {
      return null;
    }
    const payload = JSON.parse(raw);
    if (payload.version !== STATE_SCHEMA_VERSION) {
      return null;
    }
    const state = payload.state;
    return {
      ...state,
      players: state.players.map(revivePlayer),
      talon: reviveCards(state.talon || []),
      atoutCard: state.atoutCard ? Card.from(state.atoutCard) : null,
      currentTrick: {
        ...state.currentTrick,
        cards: state.currentTrick.cards.map((entry) => ({
          ...entry,
          card: Card.from(entry.card),
        })),
      },
    };
  }

  clearState() {
    this.storage?.removeItem(STATE_KEY);
  }
}
