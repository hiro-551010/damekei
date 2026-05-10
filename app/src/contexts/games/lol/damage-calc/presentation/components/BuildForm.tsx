"use client";

import { useState } from "react";
import { ItemDto } from "../../application/dto";
import SearchableSelect, { SelectOption } from "@/shared/components/SearchableSelect";
import { useLanguage } from "@/shared/contexts/LanguageContext";

type StatCategory = "all" | "ad" | "ap" | "other";
type TierCategory = "all" | "completed" | "component" | "starter";

type Props = {
  items: ItemDto[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  maxItems?: number;
};

export function BuildForm({ items, selectedIds, onChange, maxItems = 6 }: Props) {
  const { language } = useLanguage();
  const [statFilter, setStatFilter] = useState<StatCategory>("all");
  const [tierFilter, setTierFilter] = useState<TierCategory>("all");

  const filteredItems = items.filter((item) => {
    const matchStat =
      statFilter === "all" ||
      (statFilter === "ad" && item.stats.ad !== null) ||
      (statFilter === "ap" && item.stats.ap !== null) ||
      (statFilter === "other" && item.stats.ad === null && item.stats.ap === null);

    const matchTier =
      tierFilter === "all" ||
      (tierFilter === "completed" && item.tier >= 3) ||
      (tierFilter === "component" && item.tier === 2) ||
      (tierFilter === "starter" && item.tier === 1);

    return matchStat && matchTier;
  });

  const options: SelectOption<number>[] = filteredItems.map((i) => ({
    value: i.id,
    searchText: language === "ja" ? i.name : i.nameEn,
  }));

  function addItem(id: number | null) {
    if (id == null || selectedIds.includes(id) || selectedIds.length >= maxItems) return;
    onChange([...selectedIds, id]);
  }

  function removeItem(id: number) {
    onChange(selectedIds.filter((i) => i !== id));
  }

  const selectedItems = items.filter((i) => selectedIds.includes(i.id));

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">ビルド（{selectedIds.length}/{maxItems}）</div>

      <div className="flex gap-1 flex-wrap">
        {(["all", "ad", "ap", "other"] as StatCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setStatFilter(cat)}
            className={`px-2 py-0.5 rounded text-xs border transition-colors ${
              statFilter === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-foreground hover:bg-gray-100"
            }`}
          >
            {cat === "all" ? "すべて" : cat === "ad" ? "AD" : cat === "ap" ? "AP" : "その他"}
          </button>
        ))}
        <span className="w-px bg-gray-300 mx-1" />
        {(["all", "completed", "component", "starter"] as TierCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setTierFilter(cat)}
            className={`px-2 py-0.5 rounded text-xs border transition-colors ${
              tierFilter === cat
                ? "bg-gray-700 text-white border-gray-700"
                : "border-gray-300 text-foreground hover:bg-gray-100"
            }`}
          >
            {cat === "all" ? "全ティア" : cat === "completed" ? "完成品" : cat === "component" ? "素材" : "スターター"}
          </button>
        ))}
      </div>

      {selectedIds.length < maxItems && (
        <SearchableSelect<number>
          options={options}
          value={null}
          onChange={addItem}
          placeholder="アイテムを検索..."
          renderOption={(opt) => <span className="text-sm text-black">{opt.searchText}</span>}
          renderSelected={(opt) => <span className="text-sm text-black">{opt.searchText}</span>}
        />
      )}
      <div className="flex flex-wrap gap-1">
        {selectedItems.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-sm text-black"
          >
            {language === "ja" ? item.name : item.nameEn}
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-400 hover:text-gray-600 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
