const SPEED_UP_NATURES = new Set(["timid", "hasty", "jolly", "naive"]);
const SPEED_DOWN_NATURES = new Set(["brave", "relaxed", "quiet", "sassy"]);

function natureSpeedMod(nature: string): number {
  if (SPEED_UP_NATURES.has(nature)) return 1.1;
  if (SPEED_DOWN_NATURES.has(nature)) return 0.9;
  return 1.0;
}

function boostMul(rank: number): number {
  return rank >= 0 ? (2 + rank) / 2 : 2 / (2 + Math.abs(rank));
}

function itemSpeedMul(itemNameEn: string): number {
  if (itemNameEn === "choice-scarf") return 1.5;
  if (itemNameEn === "iron-ball")    return 0.5;
  return 1.0;
}

export function calcActualSpeed(
  baseSpeed: number,
  speedSP: number,
  nature: string,
  speedBoostRank: number,
  itemNameEn: string
): number {
  const ev  = speedSP * 4;
  const raw = Math.floor(Math.floor((2 * baseSpeed + 31 + Math.floor(ev / 4)) * 50 / 100) + 5);
  return Math.floor(
    Math.floor(Math.floor(raw * natureSpeedMod(nature)) * boostMul(speedBoostRank)) *
    itemSpeedMul(itemNameEn)
  );
}
