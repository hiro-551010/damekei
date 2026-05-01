import { DamageType, SkillSlot } from "../domain/types";

export type ChampionSummaryDto = {
  id: string;
  name: string;
  nameEn: string;
};

export type SkillDamageSpecDto = {
  slot: SkillSlot;
  name: string;
  damageType: DamageType;
  baseDamageByRank: number[];
  totalAdRatio: number;
  bonusAdRatio: number;
  apRatio: number;
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
};

export type DefenderInputDto = {
  championId: string;
  level: number;
  itemIds: number[];
};

export type SkillDamageResultDto = {
  slot: SkillSlot;
  name: string;
  damageType: DamageType;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
};

export type CalculateDamageResultDto = {
  skills: SkillDamageResultDto[];
};
