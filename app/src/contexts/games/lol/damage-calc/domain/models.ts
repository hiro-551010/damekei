import { DamageFormula, DamageType, SkillSlot } from "./types";
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
  damageFormula: DamageFormula;
  variants?: SkillVariantSpec[];
};

export type ChampionPassiveSpec =
  | { kind: "onHitDamage"; formula: DamageFormula; damageType: DamageType };

export type SkillVariantSpec = {
  name: string;
  formula?: DamageFormula;
  multiplier?: number;
  damageType?: DamageType;
};

export type StatModifier = {
  stat: import("./types").StatRef;
  addFormula: DamageFormula;
};

export type ChampionStateModifier = {
  name: string;
  triggerSlot: SkillSlot;
  statModifiers: StatModifier[];
};

export type AACritOverride = {
  alwaysCrit: boolean;
  baseMultiplier: number;
};

export type ChampionSpecies = {
  id: string;
  name: string;
  nameEn: string;
  baseStats: ChampionBaseStats;
  statGrowth: ChampionStatGrowth;
  skills: SkillDamageSpec[];
  passiveSpec?: ChampionPassiveSpec;
  stateModifiers?: ChampionStateModifier[];
  aaCritOverride?: AACritOverride;
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

export type ItemPassive =
  | { kind: "armorPenPercent"; value: number }
  | { kind: "magicPenPercent"; value: number }
  | { kind: "critDamageAmp"; bonusFactor: number; minCritChance: number }
  | { kind: "bonusAdToAp"; ratio: number }
  | { kind: "onHitMagicDamage"; damage: number }
  | { kind: "onHitMagicDamageScaled"; base: number; apRatio: number }
  | { kind: "apAmp"; ratio: number }
  | { kind: "onHitPhysicalCurrentHpPercent"; percent: number }
  | { kind: "nthHitPhysical"; hitCount: number; minDamage: number; maxDamage: number }
  | { kind: "spellblade"; baseAdRatio: number }
  | { kind: "other"; description: string };

export type Item = {
  id: number;
  name: string;
  nameEn: string;
  stats: ItemStats;
  passives: ItemPassive[];
};

export type SkillAllocation = {
  q: number;
  w: number;
  e: number;
  r: number;
};

export function validateSkillAllocation(alloc: SkillAllocation, level: number): void {
  const total = alloc.q + alloc.w + alloc.e + alloc.r;
  const maxR = Math.floor((level - 1) / 5);
  if (total > level) {
    throw new InvalidSkillAllocationError(
      `Skill points total (${total}) exceeds champion level (${level})`
    );
  }
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
  baseAd: number;
  ap: number;
  armor: number;
  magicResist: number;
  hp: number;
  lethality: number;
  armorPenPercent: number;
  magicPenFlat: number;
  magicPenPercent: number;
  critChance: number;
  bonusArmor: number;
  bonusMagicResist: number;
  moveSpeed: number;
  bonusMoveSpeed: number;
};

export type EvaluationContext = {
  attacker: ComputedStats;
  defender: ComputedStats;
  skillRank: number;
  championLevel: number;
  stackCount?: number;
};

export type AutoAttackResult = {
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
  critPostMitigation: number | null;
  critHpPercent: number | null;
  onHitMagicPostMitigation: number | null;
  onHitMagicHpPercent: number | null;
  onHitPhysicalPostMitigation: number | null;
  onHitPhysicalHpPercent: number | null;
};

export type SkillVariantResult = {
  name: string;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
};

export type ChampionPassiveAAResult = {
  damageType: DamageType;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
};

export type ChampionStateResult = {
  stateName: string;
  rank: number;
  autoAttack: AutoAttackResult;
  skills: SkillDamageResult[];
  championPassiveAA?: ChampionPassiveAAResult;
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
  variants?: SkillVariantResult[];
};

export type DamageResult = {
  autoAttack: AutoAttackResult;
  skills: SkillDamageResult[];
  championPassiveAA?: ChampionPassiveAAResult;
  stateResults?: ChampionStateResult[];
};
