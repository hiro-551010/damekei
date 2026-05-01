import { lolDamageCalcUseCases } from "@/contexts/games/lol/damage-calc/infrastructure/container";
import { LolDamageCalcPage } from "@/contexts/games/lol/damage-calc/presentation/LolDamageCalcPage";
import { SkillAllocationDto, SkillDamageResultDto } from "@/contexts/games/lol/damage-calc/application/dto";

export default async function Page() {
  const [champions, items] = await Promise.all([
    lolDamageCalcUseCases.getChampionList(),
    lolDamageCalcUseCases.getItemList(),
  ]);

  async function calculate(
    attackerChampionId: string,
    attackerLevel: number,
    attackerItemIds: number[],
    skillAllocation: SkillAllocationDto,
    defenderChampionId: string,
    defenderLevel: number,
    defenderItemIds: number[]
  ): Promise<SkillDamageResultDto[]> {
    "use server";
    const result = await lolDamageCalcUseCases.calculateDamage(
      { championId: attackerChampionId, level: attackerLevel, itemIds: attackerItemIds, skillAllocation },
      { championId: defenderChampionId, level: defenderLevel, itemIds: defenderItemIds }
    );
    return result.skills;
  }

  return <LolDamageCalcPage champions={champions} items={items} onCalculate={calculate} />;
}
