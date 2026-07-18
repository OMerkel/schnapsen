function getSeatSymbol(index) {
  return index === 0 ? "▼" : "▲";
}

function getTypeSymbol(playerType) {
  return playerType === "ai" ? "🤖" : "🧑";
}

export function getPlayerDisplayTag(player, index) {
  const playerType = player?.type || "human";
  return `${getTypeSymbol(playerType)}${getSeatSymbol(index)}`;
}

export function getSeatSymbolForIndex(index) {
  return getSeatSymbol(index);
}
