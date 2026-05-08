"use server";

import { lolDamageCalcUseCases } from "@/contexts/games/lol/damage-calc/infrastructure/container";
import { CalculateDamageResultDto, SkillAllocationDto } from "@/contexts/games/lol/damage-calc/application/dto";

export async function calculateLolDamage(
  attackerChampionId: string,
  attackerLevel: number,
  attackerItemIds: number[],
  skillAllocation: SkillAllocationDto,
  defenderChampionId: string,
  defenderLevel: number,
  defenderItemIds: number[],
  attackerStackCount?: number,
  defenderHpPercent?: number
): Promise<CalculateDamageResultDto> {
  return lolDamageCalcUseCases.calculateDamage(
    { championId: attackerChampionId, level: attackerLevel, itemIds: attackerItemIds, skillAllocation, stackCount: attackerStackCount },
    { championId: defenderChampionId, level: defenderLevel, itemIds: defenderItemIds, hpPercent: defenderHpPercent }
  );
}
