export const SUITS = ["eichel", "blatt", "herz", "schellen"];

export const SUIT_LABELS = {
  eichel: "Eichel",
  blatt: "Blatt",
  herz: "Herz",
  schellen: "Schellen",
};

export const RANK_ORDER_20 = ["ass", "10", "könig", "ober", "unter"];
export const RANK_ORDER_24 = [...RANK_ORDER_20, "9"];

export const RANK_LABELS = {
  ass: "Ass",
  10: "Zehn",
  könig: "König",
  ober: "Ober",
  unter: "Unter",
  9: "9",
};

export const RANK_SHORT_LABELS = {
  ass: "A",
  10: "10",
  könig: "K",
  ober: "O",
  unter: "U",
  9: "9",
};

export const CARD_POINTS = {
  ass: 11,
  10: 10,
  könig: 4,
  ober: 3,
  unter: 2,
  9: 0,
};

export const DECK_VARIANTS = {
  twentyFour: "24-card",
  twenty: "20-card",
};

export const AI_LEVELS = ["easy", "medium", "hard"];
export const PLAYER_TYPES = ["human", "ai"];

export const MATCH_TARGET_DEFAULT = 7;
export const SETTINGS_SCHEMA_VERSION = 1;
export const STATE_SCHEMA_VERSION = 1;
export const TRICK_REVEAL_DELAY_MS = 4000;

export const DEFAULT_SETTINGS = Object.freeze({
  deckVariant: DECK_VARIANTS.twentyFour,
  matchTarget: MATCH_TARGET_DEFAULT,
  players: [
    { type: "human", aiLevel: "easy", name: "player_south" },
    { type: "human", aiLevel: "easy", name: "player_north" },
  ],
});

export function getRankOrder(deckVariant) {
  return deckVariant === DECK_VARIANTS.twenty ? RANK_ORDER_20 : RANK_ORDER_24;
}

export function getCardAssetPath(card) {
  return `img/deck/merkel_deutsch/${card.suit}_${encodeURIComponent(card.rank)}.svg`;
}

export function getSuitAssetPath(suit) {
  return `img/deck/merkel_deutsch/suits/${suit}.svg`;
}

export const CARD_BACK_ASSET =
  "img/deck/merkel_deutsch/carte_german_double_back.svg";
