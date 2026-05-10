import { DamageFormula, DamageType, SkillSlot } from "../domain/types";

export type ChampionSummaryDto = {
  id: string;
  name: string;
  nameEn: string;
};

export type SkillDamageSpecDto = {
  slot: SkillSlot;
  name: string;
  damageType: DamageType;
  damageFormula: DamageFormula;
};

export type ChampionDetailDto = {
  id: string;
  name: string;
  nameEn: string;
  baseStats: { hp: number; ad: number; armor: number; magicResist: number; attackSpeed: number };
  statGrowth: { hp: number; ad: number; armor: number; magicResist: number };
  skills: SkillDamageSpecDto[];
};

export type ItemDto = {
  id: number;
  name: string;
  nameEn: string;
  tier: number;
  stats: {
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
};

export type SkillAllocationDto = {
  q: number;
  w: number;
  e: number;
  r: number;
};

export type AttackerInputDto = {
  championId: string;
  level: number;
  itemIds: number[];
  skillAllocation: SkillAllocationDto;
  stackCount?: number;
};

export type DefenderInputDto = {
  championId: string;
  level: number;
  itemIds: number[];
  hpPercent?: number;
};

export type SkillVariantResultDto = {
  name: string;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
};

export type SkillDamageResultDto = {
  slot: SkillSlot;
  name: string;
  damageType: DamageType;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
  variants?: SkillVariantResultDto[];
};

export type AutoAttackResultDto = {
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

export type ChampionPassiveAAResultDto = {
  damageType: DamageType;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
};

export type ChampionStateResultDto = {
  stateName: string;
  rank: number;
  autoAttack: AutoAttackResultDto;
  skills: SkillDamageResultDto[];
  championPassiveAA?: ChampionPassiveAAResultDto;
};

export type CalculateDamageResultDto = {
  autoAttack: AutoAttackResultDto;
  skills: SkillDamageResultDto[];
  championPassiveAA?: ChampionPassiveAAResultDto;
  stateResults?: ChampionStateResultDto[];
};
