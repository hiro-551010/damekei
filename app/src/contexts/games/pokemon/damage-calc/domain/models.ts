import { DomainError } from "./errors";
import { KnockoutChance, MoveCategory, PokemonType } from "./types";

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface StatPoints {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface StatBoosts {
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Ability {
  name: string;
  nameEn: string;
}

export interface Item {
  name: string;
  nameEn: string;
}

export interface Move {
  id: number;
  name: string;
  nameEn: string;
  power: number | null;
  type: PokemonType;
  category: MoveCategory;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  nameEn: string;
  types: PokemonType[];
  baseStats: BaseStats;
  abilities: Ability[];
  learnableMoves: Move[];
}

export interface Pokemon {
  species: PokemonSpecies;
  nature: string;
  statPoints: StatPoints;
  ability: Ability;
  item: Item | null;
  boosts: StatBoosts;
}

export interface DamageResult {
  rolls: number[];
  hitCount: number;
  min: number;
  max: number;
  percentages: number[];
  minPercent: number;
  maxPercent: number;
  knockoutChance: KnockoutChance;
}

// ── バリデーション ──────────────────────────────────────────────

export function validateStatPoints(sp: StatPoints): void {
  const stats: (keyof StatPoints)[] = [
    "hp", "attack", "defense", "spAttack", "spDefense", "speed",
  ];
  for (const s of stats) {
    if (sp[s] < 0 || sp[s] > 32) {
      throw new DomainError(`statPoints.${s} は 0〜32 の範囲で指定してください`);
    }
  }
  const total = stats.reduce((sum, s) => sum + sp[s], 0);
  if (total > 66) {
    throw new DomainError(`statPoints の合計は 66 以下にしてください（現在: ${total}）`);
  }
}

export function validateAbility(pokemon: Pokemon): void {
  const valid = pokemon.species.abilities.some(
    (a) => a.nameEn === pokemon.ability.nameEn
  );
  if (!valid) {
    throw new DomainError(
      `${pokemon.species.name} は特性「${pokemon.ability.name}」を持てません`
    );
  }
}

export function computeKnockoutChance(
  rolls: number[],
  defenderMaxHp: number
): KnockoutChance {
  const koCount = rolls.filter((r) => r >= defenderMaxHp).length;
  if (koCount === 16) return "guaranteed";
  if (koCount >= 9)  return "high";
  if (koCount >= 1)  return "low";
  return "guaranteed_no";
}
