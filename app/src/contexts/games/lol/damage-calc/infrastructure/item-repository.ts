import { ItemRepository } from "../domain/ports";
import { Item } from "../domain/models";
import itemsData from "./data/items.json";

const items = itemsData as Item[];
const byId = new Map(items.map((i) => [i.id, i]));

export const itemRepository: ItemRepository = {
  async findAll() {
    return items;
  },
  async findById(id: number) {
    return byId.get(id) ?? null;
  },
};
