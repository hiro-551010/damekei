import { ChampionRepository, ItemRepository } from "../domain/ports";
import { validateSkillAllocation } from "../domain/models";
import { calculateDamage } from "../domain/services/damage-calculator";
import { NotFoundError } from "../domain/errors";
import {
  AttackerInputDto,
  CalculateDamageResultDto,
  ChampionDetailDto,
  ChampionSummaryDto,
  DefenderInputDto,
  ItemDto,
} from "./dto";

export function createUseCases(
  championRepo: ChampionRepository,
  itemRepo: ItemRepository
) {
  async function getChampionList(): Promise<ChampionSummaryDto[]> {
    const all = await championRepo.findAll();
    return all.map((c) => ({ id: c.id, name: c.name, nameEn: c.nameEn }));
  }

  async function getChampionDetail(id: string): Promise<ChampionDetailDto> {
    const c = await championRepo.findById(id);
    if (!c) throw new NotFoundError("Champion", id);
    return c;
  }

  async function getItemList(): Promise<ItemDto[]> {
    return itemRepo.findAll();
  }

  async function calculateDamageUseCase(
    attackerInput: AttackerInputDto,
    defenderInput: DefenderInputDto
  ): Promise<CalculateDamageResultDto> {
    const [atkSpecies, defSpecies, allItems] = await Promise.all([
      championRepo.findById(attackerInput.championId),
      championRepo.findById(defenderInput.championId),
      itemRepo.findAll(),
    ]);

    if (!atkSpecies) throw new NotFoundError("Champion", attackerInput.championId);
    if (!defSpecies) throw new NotFoundError("Champion", defenderInput.championId);

    const itemMap = new Map(allItems.map((i) => [i.id, i]));

    const atkItems = attackerInput.itemIds.map((id) => {
      const item = itemMap.get(id);
      if (!item) throw new NotFoundError("Item", id);
      return item;
    });

    const defItems = defenderInput.itemIds.map((id) => {
      const item = itemMap.get(id);
      if (!item) throw new NotFoundError("Item", id);
      return item;
    });

    validateSkillAllocation(attackerInput.skillAllocation, attackerInput.level);

    const attacker = {
      species: atkSpecies,
      level: attackerInput.level,
      items: atkItems,
      skillAllocation: attackerInput.skillAllocation,
    };

    const defender = {
      species: defSpecies,
      level: defenderInput.level,
      items: defItems,
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };

    const result = calculateDamage(attacker, defender);
    return result;
  }

  return { getChampionList, getChampionDetail, getItemList, calculateDamage: calculateDamageUseCase };
}
