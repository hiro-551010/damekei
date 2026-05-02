"use server";

import { lolDamageCalcUseCases } from "@/contexts/games/lol/damage-calc/infrastructure/container";
import { SkillAllocationDto, SkillDamageResultDto } from "@/contexts/games/lol/damage-calc/application/dto";

export async function calculateLolDamage(
  attackerChampionId: string,
  attackerLevel: number,
  attackerItemIds: number[],
  skillAllocation: SkillAllocationDto,
  defenderChampionId: string,
  defenderLevel: number,
  defenderItemIds: number[]
): Promise<SkillDamageResultDto[]> {
  const result = await lolDamageCalcUseCases.calculateDamage(
    { championId: attackerChampionId, level: attackerLevel, itemIds: attackerItemIds, skillAllocation },
    { championId: defenderChampionId, level: defenderLevel, itemIds: defenderItemIds }
  );
  return result.skills;
}
