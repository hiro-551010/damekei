"use client";

import { ChampionSummaryDto, ItemDto, SkillAllocationDto } from "../../application/dto";
import { BuildForm } from "./BuildForm";
import { SkillAllocationForm } from "./SkillAllocationForm";
import SearchableSelect, { SelectOption } from "@/shared/components/SearchableSelect";

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
}: Props) {
  const options: SelectOption<string>[] = champions.map((c) => ({
    value: c.id,
    searchText: c.name,
  }));

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <h2 className="font-semibold text-lg">{title}</h2>

      <div className="space-y-1">
        <label className="text-sm font-medium">チャンピオン</label>
        <SearchableSelect<string>
          options={options}
          value={selectedChampionId}
          onChange={onChampionChange}
          placeholder="チャンピオンを検索..."
          renderOption={(opt) => <span className="text-sm">{opt.searchText}</span>}
          renderSelected={(opt) => <span className="text-sm font-semibold">{opt.searchText}</span>}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">レベル</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={18}
            value={level}
            onChange={(e) => onLevelChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-8 text-center font-semibold">{level}</span>
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
    </div>
  );
}
