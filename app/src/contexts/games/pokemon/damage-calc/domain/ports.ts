import { Move, Pokemon, DamageResult, PokemonSpecies } from "./models";

export interface FieldCondition {
  weather?: "sun" | "rain" | "sand" | "snow" | null;
  terrain?: "electric" | "grassy" | "misty" | "psychic" | null;
}

export interface PokemonRepository {
  getAll(): PokemonSpecies[];
  getById(id: number): PokemonSpecies | undefined;
}

export interface DamageCalculator {
  calculate(
    attacker: Pokemon,
    defender: Pokemon,
    move: Move,
    field?: FieldCondition,
    hitCount?: number,
  ): DamageResult;
}
