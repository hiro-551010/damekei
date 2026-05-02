import { lolDamageCalcUseCases } from "@/contexts/games/lol/damage-calc/infrastructure/container";
import { LolDamageCalcPage } from "@/contexts/games/lol/damage-calc/presentation/LolDamageCalcPage";
import { calculateLolDamage } from "./actions";

export default async function Page() {
  const [champions, items] = await Promise.all([
    lolDamageCalcUseCases.getChampionList(),
    lolDamageCalcUseCases.getItemList(),
  ]);

  return <LolDamageCalcPage champions={champions} items={items} onCalculate={calculateLolDamage} />;
}
