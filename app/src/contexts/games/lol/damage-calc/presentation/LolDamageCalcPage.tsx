"use client";

import { useState, useEffect } from "react";
import { CalculateDamageResultDto, ChampionSummaryDto, ItemDto, SkillAllocationDto } from "../application/dto";
import { ChampionPanel } from "./components/ChampionPanel";
import { DamageResultTable } from "./components/DamageResultTable";

type Props = {
  champions: ChampionSummaryDto[];
  items: ItemDto[];
  onCalculate: (
    attackerChampionId: string,
    attackerLevel: number,
    attackerItemIds: number[],
    skillAllocation: SkillAllocationDto,
    defenderChampionId: string,
    defenderLevel: number,
    defenderItemIds: number[]
  ) => Promise<CalculateDamageResultDto>;
};

function defaultAllocation(): SkillAllocationDto {
  return { q: 0, w: 0, e: 0, r: 0 };
}

export function LolDamageCalcPage({ champions, items, onCalculate }: Props) {
  const [atkChampion, setAtkChampion] = useState<string | null>(null);
  const [atkLevel, setAtkLevel] = useState(1);
  const [atkItems, setAtkItems] = useState<number[]>([]);
  const [atkAlloc, setAtkAlloc] = useState<SkillAllocationDto>(defaultAllocation());

  const [defChampion, setDefChampion] = useState<string | null>(null);
  const [defLevel, setDefLevel] = useState(1);
  const [defItems, setDefItems] = useState<number[]>([]);

  const [results, setResults] = useState<CalculateDamageResultDto | null>(null);
  // null = no champions selected; array = calculation result (may contain zero-damage skills)
  const [error, setError] = useState<string | null>(null);

  // Clamp allocation when level decreases
  useEffect(() => {
    setAtkAlloc((prev) => {
      const maxR = Math.floor((atkLevel - 1) / 5);
      const r = Math.min(prev.r, maxR);
      const remaining = atkLevel - r;
      const q = Math.min(prev.q, remaining);
      const w = Math.min(prev.w, remaining - q);
      const e = Math.min(prev.e, remaining - q - w);
      return { q, w, e, r };
    });
  }, [atkLevel]);

  useEffect(() => {
    if (!atkChampion || !defChampion) {
      setResults(null);
      return;
    }
    setError(null);
    onCalculate(atkChampion, atkLevel, atkItems, atkAlloc, defChampion, defLevel, defItems)
      .then(setResults)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [atkChampion, atkLevel, atkItems, atkAlloc, defChampion, defLevel, defItems, onCalculate]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">LoL ダメージ計算</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChampionPanel
          title="攻撃側"
          champions={champions}
          items={items}
          selectedChampionId={atkChampion}
          level={atkLevel}
          selectedItemIds={atkItems}
          skillAllocation={atkAlloc}
          onChampionChange={setAtkChampion}
          onLevelChange={setAtkLevel}
          onItemsChange={setAtkItems}
          onSkillAllocationChange={setAtkAlloc}
        />
        <ChampionPanel
          title="防御側"
          champions={champions}
          items={items}
          selectedChampionId={defChampion}
          level={defLevel}
          selectedItemIds={defItems}
          onChampionChange={setDefChampion}
          onLevelChange={setDefLevel}
          onItemsChange={setDefItems}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      )}

      <div className="border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-3 text-foreground">ダメージ結果</h2>
        {results === null ? (
          <div className="text-sm text-foreground text-center py-4">チャンピオンを選択してください</div>
        ) : (
          <DamageResultTable autoAttack={results.autoAttack} skills={results.skills} />
        )}
      </div>
    </div>
  );
}
