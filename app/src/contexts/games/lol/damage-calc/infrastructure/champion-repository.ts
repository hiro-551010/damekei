import { ChampionRepository } from "../domain/ports";
import { ChampionSpecies } from "../domain/models";
import championsData from "./data/champions.json";

const champions = championsData as ChampionSpecies[];
const byId = new Map(champions.map((c) => [c.id, c]));

export const championRepository: ChampionRepository = {
  async findAll() {
    return champions;
  },
  async findById(id: string) {
    return byId.get(id) ?? null;
  },
};
