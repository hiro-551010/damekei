import { ItemRepository } from "../domain/ports";
import { Item, ItemPassive } from "../domain/models";
import itemsData from "./data/items.json";
import itemPassivesData from "./data/item-passives.json";

const passivesMap = itemPassivesData as Record<string, ItemPassive[]>;
const items: Item[] = (itemsData as Omit<Item, "passives">[]).map((item) => ({
  ...item,
  passives: passivesMap[String(item.id)] ?? [],
}));
const byId = new Map(items.map((i) => [i.id, i]));

export const itemRepository: ItemRepository = {
  async findAll() {
    return items;
  },
  async findById(id: number) {
    return byId.get(id) ?? null;
  },
};
