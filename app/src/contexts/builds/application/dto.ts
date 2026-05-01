export type StatPointsDto = {
  hp: number; attack: number; defense: number;
  spAttack: number; spDefense: number; speed: number;
};

export type StatBoostsDto = {
  attack: number; defense: number; spAttack: number; spDefense: number; speed: number;
};

export type BuildSlotDto = {
  slotIndex: number;
  pokemonId: number | null;
  nature: string;
  statPoints: StatPointsDto;
  abilityNameEn: string;
  itemNameEn: string;
  boosts: StatBoostsDto;
  moveNameEn: string;
};

export type SaveBuildInput = {
  id?: string;
  name: string;
  slots: BuildSlotDto[];
};

export type SaveBuildResult = {
  id: string;
  shareToken: string;
};

export type BuildSummaryDto = {
  id: string;
  name: string;
  shareToken: string;
  slotCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BuildDetailDto = {
  id: string;
  name: string;
  shareToken: string;
  slots: BuildSlotDto[];
  createdAt: string;
  updatedAt: string;
};
