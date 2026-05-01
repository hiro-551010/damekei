import { PokemonRepository } from "../domain/ports";
import { Move, PokemonSpecies } from "../domain/models";
import { MoveCategory, PokemonType } from "../domain/types";
import pokemonData from "./data/pokemon.json";
import movesData from "./data/moves.json";

type RawMove = {
  id: number;
  name: string;
  nameEn: string;
  power: number | null;
  type: string;
  category: string;
};

const moveMap = new Map<number, Move>(
  (movesData as RawMove[]).map((m) => [
    m.id,
    {
      id: m.id,
      name: m.name,
      nameEn: m.nameEn,
      power: m.power,
      type: m.type as PokemonType,
      category: m.category as MoveCategory,
    },
  ])
);

const allSpecies: PokemonSpecies[] = (pokemonData as any[]).map((p) => ({
  id: p.id,
  name: p.name,
  nameEn: p.nameEn,
  types: p.types as PokemonType[],
  baseStats: p.baseStats,
  abilities: p.abilities,
  learnableMoves: (p.learnableMoveIds as number[])
    .map((id) => moveMap.get(id))
    .filter((m): m is Move => m !== undefined),
}));

const speciesMap = new Map<number, PokemonSpecies>(
  allSpecies.map((s) => [s.id, s])
);

export class PokemonRepositoryImpl implements PokemonRepository {
  getAll(): PokemonSpecies[] {
    return allSpecies;
  }

  getById(id: number): PokemonSpecies | undefined {
    return speciesMap.get(id);
  }
}
