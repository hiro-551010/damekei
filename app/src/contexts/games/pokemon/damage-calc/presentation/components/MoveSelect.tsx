"use client";

import { MoveDto } from "../../application/dto";
import SearchableSelect from "@/shared/components/SearchableSelect";

const TYPE_LABEL: Record<string, string> = {
  normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき",
  grass: "くさ", ice: "こおり", fighting: "かくとう", poison: "どく",
  ground: "じめん", flying: "ひこう", psychic: "エスパー", bug: "むし",
  rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン", dark: "あく",
  steel: "はがね", fairy: "フェアリー",
};

const TYPE_COLOR: Record<string, string> = {
  normal: "bg-[#A8A878]", fire: "bg-[#F08030]", water: "bg-[#6890F0]",
  electric: "bg-[#F8D030] text-yellow-900", grass: "bg-[#78C850]",
  ice: "bg-[#98D8D8] text-teal-900", fighting: "bg-[#C03028]",
  poison: "bg-[#A040A0]", ground: "bg-[#E0C068] text-yellow-900",
  flying: "bg-[#A890F0]", psychic: "bg-[#F85888]", bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]", ghost: "bg-[#705898]", dragon: "bg-[#7038F8]",
  dark: "bg-[#705848]", steel: "bg-[#B8B8D0] text-slate-700",
  fairy: "bg-[#EE99AC]",
};

const CAT_STYLE: Record<string, string> = {
  physical: "bg-[#FFE0D0] text-[#C03010]",
  special:  "bg-[#E0D8FF] text-[#4020C0]",
  status:   "bg-zinc-200 text-zinc-600",
};

const CAT_LABEL: Record<string, string> = {
  physical: "物", special: "特", status: "変",
};

interface Props {
  moves: MoveDto[];
  value: string;
  onChange: (nameEn: string) => void;
  disabled?: boolean;
}

export default function MoveSelect({ moves, value, onChange, disabled }: Props) {
  const moveMap = new Map(moves.map((m) => [m.nameEn, m]));

  const renderBadges = (m: MoveDto) => (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold text-white ${TYPE_COLOR[m.type] ?? "bg-zinc-400"}`}>
        {TYPE_LABEL[m.type] ?? m.type}
      </span>
      <span className="flex-1 truncate text-[12px] font-bold text-zinc-800">{m.name}</span>
      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-extrabold ${CAT_STYLE[m.category]}`}>
        {CAT_LABEL[m.category]}
      </span>
      <span className="shrink-0 text-[11px] font-bold text-zinc-400">
        {m.power ?? "—"}
      </span>
    </div>
  );

  return (
    <div>
      <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
        ⚡ わざ選択
      </label>
      <SearchableSelect<string>
        options={moves.map((m) => ({
          value: m.nameEn,
          searchText: `${m.name} ${m.nameEn}`,
        }))}
        value={value || null}
        onChange={(v) => onChange(v ?? "")}
        placeholder="わざ名で検索…"
        disabled={disabled}
        variant="neutral"
        renderSelected={(opt) => {
          const m = moveMap.get(opt.value);
          return m ? renderBadges(m) : <span>{opt.value}</span>;
        }}
        renderOption={(opt) => {
          const m = moveMap.get(opt.value);
          return m ? renderBadges(m) : <span>{opt.value}</span>;
        }}
      />
    </div>
  );
}
