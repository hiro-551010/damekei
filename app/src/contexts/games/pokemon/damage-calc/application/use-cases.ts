import { DamageCalculator, PokemonRepository } from "../domain/ports";
import { NotFoundError } from "../domain/errors";
import { validateStatPoints, validateAbility } from "../domain/models";
import {
  CalculateDamageQuery,
  DamageResultDto,
  PokemonDetailDto,
  PokemonListItemDto,
} from "./dto";

export function getPokemonList(repo: PokemonRepository): PokemonListItemDto[] {
  return repo.getAll().map((s) => ({
    id: s.id,
    name: s.name,
    nameEn: s.nameEn,
    types: s.types,
    baseStats: s.baseStats,
  }));
}

export function getPokemonDetail(
  repo: PokemonRepository,
  pokemonId: number
): PokemonDetailDto {
  const species = repo.getById(pokemonId);
  if (!species) throw new NotFoundError(`ポケモン ID ${pokemonId} が見つかりません`);

  return {
    id: species.id,
    name: species.name,
    nameEn: species.nameEn,
    types: species.types,
    baseStats: species.baseStats,
    abilities: species.abilities,
    moves: species.learnableMoves.map((m) => ({
      id: m.id ?? 0,
      name: m.name,
      nameEn: m.nameEn,
      power: m.power,
      type: m.type,
      category: m.category,
    })),
  };
}

export function calculateDamage(
  repo: PokemonRepository,
  calc: DamageCalculator,
  query: CalculateDamageQuery
): DamageResultDto {
  const atkSpecies = repo.getById(query.attacker.pokemonId);
  if (!atkSpecies) throw new NotFoundError(`攻撃側ポケモン ID ${query.attacker.pokemonId} が見つかりません`);

  const defSpecies = repo.getById(query.defender.pokemonId);
  if (!defSpecies) throw new NotFoundError(`防御側ポケモン ID ${query.defender.pokemonId} が見つかりません`);

  const toAbility = (species: typeof atkSpecies, nameEn: string) => {
    const found = species.abilities.find((a) => a.nameEn === nameEn);
    return found ?? { name: nameEn, nameEn };
  };

  const attacker = {
    species: atkSpecies,
    nature: query.attacker.nature,
    statPoints: query.attacker.statPoints,
    ability: toAbility(atkSpecies, query.attacker.abilityNameEn),
    item: query.attacker.itemNameEn
      ? { name: query.attacker.itemNameEn, nameEn: query.attacker.itemNameEn }
      : null,
    boosts: query.attacker.boosts,
  };

  const defender = {
    species: defSpecies,
    nature: query.defender.nature,
    statPoints: query.defender.statPoints,
    ability: toAbility(defSpecies, query.defender.abilityNameEn),
    item: query.defender.itemNameEn
      ? { name: query.defender.itemNameEn, nameEn: query.defender.itemNameEn }
      : null,
    boosts: query.defender.boosts,
  };

  validateStatPoints(attacker.statPoints);
  validateStatPoints(defender.statPoints);
  validateAbility(attacker);
  validateAbility(defender);

  const move = atkSpecies.learnableMoves.find(
    (m) => m.nameEn === query.moveNameEn
  );
  if (!move) throw new NotFoundError(`技「${query.moveNameEn}」が見つかりません`);

  const result = calc.calculate(attacker, defender, move, query.field, query.hitCount);

  return {
    rolls: result.rolls,
    hitCount: result.hitCount,
    min: result.min,
    max: result.max,
    percentages: result.percentages,
    minPercent: result.minPercent,
    maxPercent: result.maxPercent,
    knockoutChance: result.knockoutChance,
  };
}
