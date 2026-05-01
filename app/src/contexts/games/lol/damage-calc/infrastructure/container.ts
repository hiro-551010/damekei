import { createUseCases } from "../application/use-cases";
import { championRepository } from "./champion-repository";
import { itemRepository } from "./item-repository";

export const lolDamageCalcUseCases = createUseCases(championRepository, itemRepository);
