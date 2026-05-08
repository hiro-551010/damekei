import { Champion, ComputedStats } from "../models";

function statAtLevel(base: number, growth: number, level: number): number {
  if (level <= 1) return base;
  return base + growth * (level - 1) * (0.7025 + 0.0175 * (level - 1));
}

export function computeStats(champion: Champion): ComputedStats {
  const { species, level, items } = champion;
  const { baseStats, statGrowth } = species;

  const baseAd = statAtLevel(baseStats.ad, statGrowth.ad, level);

  let bonusAd = 0;
  let ap = 0;
  let bonusArmor = 0;
  let bonusMagicResist = 0;
  let bonusHp = 0;
  let lethality = 0;
  let armorPenPercent = 0;
  let magicPenFlat = 0;
  let magicPenPercent = 0;
  let critChance = 0;

  for (const item of items) {
    const s = item.stats;
    bonusAd += s.ad ?? 0;
    ap += s.ap ?? 0;
    bonusArmor += s.armor ?? 0;
    bonusMagicResist += s.magicResist ?? 0;
    bonusHp += s.hp ?? 0;
    lethality += s.lethality ?? 0;
    armorPenPercent += s.armorPenPercent ?? 0;
    magicPenFlat += s.magicPenFlat ?? 0;
    magicPenPercent += s.magicPenPercent ?? 0;
    critChance += s.critChance ?? 0;
  }

  const apAmpTotal = items
    .flatMap((i) => i.passives)
    .filter((p): p is { kind: "apAmp"; ratio: number } => p.kind === "apAmp")
    .reduce((sum, p) => sum + p.ratio, 0);
  ap = ap * (1 + apAmpTotal);

  const totalAd = baseAd + bonusAd;

  return {
    totalAd,
    bonusAd,
    baseAd,
    ap,
    armor: statAtLevel(baseStats.armor, statGrowth.armor, level) + bonusArmor,
    magicResist: statAtLevel(baseStats.magicResist, statGrowth.magicResist, level) + bonusMagicResist,
    hp: statAtLevel(baseStats.hp, statGrowth.hp, level) + bonusHp,
    lethality,
    armorPenPercent,
    magicPenFlat,
    magicPenPercent,
    critChance,
    bonusArmor,
    bonusMagicResist,
    moveSpeed: 0,
    bonusMoveSpeed: 0,
  };
}
