"use client";

import { ChampionSummaryDto, ItemDto, SkillAllocationDto } from "../../application/dto";
import { BuildForm } from "./BuildForm";
import { SkillAllocationForm } from "./SkillAllocationForm";
import SearchableSelect, { SelectOption } from "@/shared/components/SearchableSelect";
import { useLanguage } from "@/shared/contexts/LanguageContext";

type Props = {
  title: string;
  champions: ChampionSummaryDto[];
  items: ItemDto[];
  selectedChampionId: string | null;
  level: number;
  selectedItemIds: number[];
  skillAllocation?: SkillAllocationDto;
  onChampionChange: (id: string | null) => void;
  onLevelChange: (level: number) => void;
  onItemsChange: (ids: number[]) => void;
  onSkillAllocationChange?: (alloc: SkillAllocationDto) => void;
  stackCount?: number;
  onStackCountChange?: (n: number) => void;
  hpPercent?: number;
  onHpPercentChange?: (pct: number) => void;
};

export function ChampionPanel({
  title,
  champions,
  items,
  selectedChampionId,
  level,
  selectedItemIds,
  skillAllocation,
  onChampionChange,
  onLevelChange,
  onItemsChange,
  onSkillAllocationChange,
  stackCount,
  onStackCountChange,
  hpPercent,
  onHpPercentChange,
}: Props) {
  const { language } = useLanguage();
  const options: SelectOption<string>[] = champions.map((c) => ({
    value: c.id,
    searchText: language === "ja" ? c.name : c.nameEn,
  }));

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <h2 className="font-semibold text-lg text-foreground">{title}</h2>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">チャンピオン</label>
        <SearchableSelect<string>
          options={options}
          value={selectedChampionId}
          onChange={onChampionChange}
          placeholder="チャンピオンを検索..."
          renderOption={(opt) => <span className="text-sm text-black">{opt.searchText}</span>}
          renderSelected={(opt) => <span className="text-sm font-semibold text-black">{opt.searchText}</span>}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">レベル</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={18}
            value={level}
            onChange={(e) => onLevelChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-8 text-center font-semibold text-foreground">{level}</span>
        </div>
      </div>

      <BuildForm items={items} selectedIds={selectedItemIds} onChange={onItemsChange} />

      {skillAllocation && onSkillAllocationChange && (
        <SkillAllocationForm
          level={level}
          allocation={skillAllocation}
          onChange={onSkillAllocationChange}
        />
      )}

      {stackCount !== undefined && onStackCountChange && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">スタック数</label>
          <input
            type="number"
            min={0}
            value={stackCount}
            onChange={(e) => onStackCountChange(Math.max(0, Number(e.target.value)))}
            className="w-24 border rounded px-2 py-1 text-sm text-foreground"
          />
        </div>
      )}

      {hpPercent !== undefined && onHpPercentChange && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">現在HP%</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={100}
              value={hpPercent}
              onChange={(e) => onHpPercentChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-10 text-center font-semibold text-foreground">{hpPercent}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
