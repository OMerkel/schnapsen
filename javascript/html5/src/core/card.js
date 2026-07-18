import {
  CARD_POINTS,
  RANK_LABELS,
  RANK_SHORT_LABELS,
  SUIT_LABELS,
} from "../config/constants.js";

export class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.id = `${suit}:${rank}`;
    this.points = CARD_POINTS[rank] ?? 0;
    Object.freeze(this);
  }

  equals(other) {
    return Boolean(other) && this.id === other.id;
  }

  get label() {
    return `${RANK_LABELS[this.rank]} von ${SUIT_LABELS[this.suit]}`;
  }

  get shortLabel() {
    return `${RANK_SHORT_LABELS[this.rank]} ${SUIT_LABELS[this.suit]}`;
  }

  toJSON() {
    return { suit: this.suit, rank: this.rank };
  }

  static from(value) {
    return value instanceof Card ? value : new Card(value.suit, value.rank);
  }
}
