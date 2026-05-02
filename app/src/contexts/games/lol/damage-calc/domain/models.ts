import { DamageType, SkillSlot } from "./types";
import { InvalidSkillAllocationError } from "./errors";

export type ChampionBaseStats = {
  hp: number;
  ad: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
};

export type ChampionStatGrowth = {
  hp: number;
  ad: number;
  armor: number;
  magicResist: number;
};

export type SkillDamageSpec = {
  slot: SkillSlot;
  name: string;
  damageType: DamageType;
  baseDamageByRank: number[];
  totalAdRatio: number;
  bonusAdRatio: number;
  apRatio: number;
};

export type ChampionSpecies = {
  id: string;
  name: string;
  nameEn: string;
  baseStats: ChampionBaseStats;
  statGrowth: ChampionStatGrowth;
  skills: SkillDamageSpec[];
};

export type ItemStats = {
  ad: number | null;
  ap: number | null;
  armor: number | null;
  magicResist: number | null;
  hp: number | null;
  lethality: number | null;
  armorPenPercent: number | null;
  magicPenFlat: number | null;
  magicPenPercent: number | null;
  attackSpeed: number | null;
  critChance: number | null;
  lifeSteal: number | null;
  abilityHaste: number | null;
};

export type Item = {
  id: number;
  name: string;
  nameEn: string;
  stats: ItemStats;
};

export type SkillAllocation = {
  q: number;
  w: number;
  e: number;
  r: number;
};

export function validateSkillAllocation(alloc: SkillAllocation, level: number): void {
  const total = alloc.q + alloc.w + alloc.e + alloc.r;
  if (total !== level) {
    throw new InvalidSkillAllocationError(
      `Skill points total (${total}) must equal champion level (${level})`
    );
  }
  const maxR = Math.floor((level - 1) / 5);
  if (alloc.r > maxR) {
    throw new InvalidSkillAllocationError(
      `R rank (${alloc.r}) exceeds max allowed (${maxR}) at level ${level}`
    );
  }
  if (alloc.q < 0 || alloc.w < 0 || alloc.e < 0 || alloc.r < 0) {
    throw new InvalidSkillAllocationError("Skill ranks must be non-negative");
  }
}

export type Champion = {
  species: ChampionSpecies;
  level: number;
  items: Item[];
  skillAllocation: SkillAllocation;
};

export type ComputedStats = {
  totalAd: number;
  bonusAd: number;
  ap: number;
  armor: number;
  magicResist: number;
  hp: number;
  lethality: number;
  armorPenPercent: number;
  magicPenFlat: number;
  magicPenPercent: number;
};

export type SkillDamageResult = {
  slot: SkillSlot;
  name: string;
  damageType: DamageType;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
};

export type DamageResult = {
  skills: SkillDamageResult[];
};
