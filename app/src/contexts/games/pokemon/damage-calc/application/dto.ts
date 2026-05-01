import { MoveCategory, PokemonType } from "../domain/types";

export type BaseStatsDto = {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
};

export type PokemonListItemDto = {
  id: number;
  name: string;
  nameEn: string;
  types: PokemonType[];
  baseStats: BaseStatsDto;
};

export type AbilityDto = {
  name: string;
  nameEn: string;
};

export type MoveDto = {
  id: number;
  name: string;
  nameEn: string;
  power: number | null;
  type: PokemonType;
  category: MoveCategory;
};

export type PokemonDetailDto = {
  id: number;
  name: string;
  nameEn: string;
  types: PokemonType[];
  baseStats: BaseStatsDto;
  abilities: AbilityDto[];
  moves: MoveDto[];
};

export type StatPointsDto = {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
};

export type StatBoostsDto = {
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
};

export type PokemonInputDto = {
  pokemonId: number;
  nature: string;
  statPoints: StatPointsDto;
  abilityNameEn: string;
  itemNameEn: string | null;
  boosts: StatBoostsDto;
};

export type CalculateDamageQuery = {
  attacker: PokemonInputDto;
  defender: PokemonInputDto;
  moveNameEn: string;
  hitCount?: number;
  field?: {
    weather?: "sun" | "rain" | "sand" | "snow" | null;
    terrain?: "electric" | "grassy" | "misty" | "psychic" | null;
  };
};

export type DamageResultDto = {
  rolls: number[];
  hitCount: number;
  min: number;
  max: number;
  percentages: number[];
  minPercent: number;
  maxPercent: number;
  knockoutChance: "guaranteed" | "high" | "low" | "guaranteed_no";
};
