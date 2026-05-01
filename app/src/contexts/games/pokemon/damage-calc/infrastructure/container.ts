import { PokemonRepositoryImpl } from "./pokemon-repository";
import { SmogonDamageCalculator } from "./smogon-calculator";

export const pokemonRepository = new PokemonRepositoryImpl();
export const damageCalculator = new SmogonDamageCalculator();
