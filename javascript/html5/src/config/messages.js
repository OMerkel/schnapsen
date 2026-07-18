import { RANK_LABELS, SUIT_LABELS } from "./constants.js";

export function formatCardName(card) {
  return `${RANK_LABELS[card.rank]} von ${SUIT_LABELS[card.suit]}`;
}

export const STATUS_MESSAGES = {
  resumed: "Gespeicherter Spielstand wurde fortgesetzt.",
  saved: "Spielstand gespeichert.",
  illegal: "Diese Aktion ist gerade nicht erlaubt.",
  handWon: (name, gamePoints) =>
    `${name} gewinnt die Hand und erhält ${gamePoints} Spielpunkt${gamePoints === 1 ? "" : "e"}.`,
  matchWon: (name) => `${name} gewinnt den Bummerl.`,
  talonClosed: (name) =>
    `${name} schließt den Talon. Ab jetzt gilt strenges Spiel.`,
  atoutSwapped: (name) =>
    `${name} tauscht die offene Atout-Karte mit der niedrigsten Atout-Karte aus der Hand.`,
  marriageAnnounced: (name, suit) =>
    `${name} sagt Marriage in ${SUIT_LABELS[suit]} an. Spiele jetzt König oder Ober dieser Farbe aus.`,
  marriageScored: (name, points) => `${name} meldet ${points} Punkte.`,
  declare66: (name) => `${name} sagt 66 an.`,
};
