"use client";

import { ItemDto } from "../../application/dto";
import SearchableSelect, { SelectOption } from "@/shared/components/SearchableSelect";

type Props = {
  items: ItemDto[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  maxItems?: number;
};

export function BuildForm({ items, selectedIds, onChange, maxItems = 6 }: Props) {
  const options: SelectOption<number>[] = items.map((i) => ({
    value: i.id,
    searchText: i.name,
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
            {item.name}
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
