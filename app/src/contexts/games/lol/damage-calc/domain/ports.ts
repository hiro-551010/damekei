import { ChampionSpecies } from "./models";
import { Item } from "./models";

export interface ChampionRepository {
  findAll(): Promise<ChampionSpecies[]>;
  findById(id: string): Promise<ChampionSpecies | null>;
}

export interface ItemRepository {
  findAll(): Promise<Item[]>;
  findById(id: number): Promise<Item | null>;
}
