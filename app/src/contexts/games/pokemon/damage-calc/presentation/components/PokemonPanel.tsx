"use client";

import { PokemonDetailDto, PokemonListItemDto, StatBoostsDto, StatPointsDto } from "../../application/dto";
import NatureSelect from "./NatureSelect";
import StatPointsForm from "./StatPointsForm";
import AbilitySelect from "./AbilitySelect";
import ItemSelect from "./ItemSelect";
import BoostForm from "./BoostForm";
import SearchableSelect, { SelectOption } from "@/shared/components/SearchableSelect";
import { useMemo, useState } from "react";

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

const TYPE_LABEL: Record<string, string> = {
  normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき",
  grass: "くさ", ice: "こおり", fighting: "かくとう", poison: "どく",
  ground: "じめん", flying: "ひこう", psychic: "エスパー", bug: "むし",
  rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン", dark: "あく",
  steel: "はがね", fairy: "フェアリー",
};

const STAT_LABELS = ["HP", "こう", "ぼう", "とく", "とぼ", "すば"];
const STAT_KEYS = ["hp", "attack", "defense", "spAttack", "spDefense", "speed"] as const;
const STAT_COLORS = [
  "from-green-300 to-green-500",
  "from-orange-300 to-orange-500",
  "from-blue-300 to-blue-500",
  "from-purple-300 to-purple-500",
  "from-teal-300 to-teal-500",
  "from-yellow-300 to-yellow-500",
];

export interface PokemonState {
  pokemonId: number | null;
  nature: string;
  statPoints: StatPointsDto;
  abilityNameEn: string;
  itemNameEn: string;
  boosts: StatBoostsDto;
}

export const DEFAULT_BOOSTS: StatBoostsDto = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
export const DEFAULT_SP: StatPointsDto = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

interface Props {
  variant: "atk" | "def";
  state: PokemonState;
  onChange: (s: PokemonState) => void;
  pokemonList: PokemonListItemDto[];
  detail: PokemonDetailDto | null;
}

export default function PokemonPanel({ variant, state, onChange, pokemonList, detail }: Props) {
  const [boostOpen, setBoostOpen] = useState(true);
  const isAtk = variant === "atk";
  const tint = isAtk ? "bg-orange-50 border-orange-200" : "bg-emerald-50 border-emerald-200";
  const badge = isAtk ? "bg-orange-500" : "bg-emerald-500";
  const label = isAtk ? "⚔ 攻撃側" : "🛡 防御側";

  const set = (patch: Partial<PokemonState>) => onChange({ ...state, ...patch });

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tint}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white ${badge}`}>
          {label}
        </span>
      </div>

      {/* ポケモン選択 */}
      <div className="mb-3">
        <label className="mb-0.5 block text-[10px] font-bold text-zinc-500">ポケモン</label>
        <SearchableSelect<number>
          options={pokemonList.map((p) => ({
            value: p.id,
            searchText: `${p.name} ${p.nameEn}`,
          }))}
          value={state.pokemonId}
          onChange={(id) => set({ pokemonId: id, abilityNameEn: "", statPoints: DEFAULT_SP, boosts: DEFAULT_BOOSTS })}
          placeholder="名前で検索…"
          variant={variant}
          renderSelected={(opt) => {
            const p = pokemonList.find((x) => x.id === opt.value);
            return (
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-zinc-800">{p?.name}</span>
                {p?.types.map((t) => (
                  <span key={t} className={`rounded-full px-1.5 py-0.5 text-[8px] font-extrabold text-white ${TYPE_COLOR[t] ?? "bg-zinc-400"}`}>
                    {TYPE_LABEL[t] ?? t}
                  </span>
                ))}
              </div>
            );
          }}
          renderOption={(opt) => {
            const p = pokemonList.find((x) => x.id === opt.value);
            return (
              <div className="flex items-center gap-2">
                <span className="w-8 text-right text-[10px] text-zinc-300">#{p?.id}</span>
                <span className="flex-1 text-[12px] font-bold text-zinc-800">{p?.name}</span>
                <div className="flex gap-1">
                  {p?.types.map((t) => (
                    <span key={t} className={`rounded-full px-1.5 py-0.5 text-[8px] font-extrabold text-white ${TYPE_COLOR[t] ?? "bg-zinc-400"}`}>
                      {TYPE_LABEL[t] ?? t}
                    </span>
                  ))}
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* タイプ・種族値プレビュー */}
      {detail && (
        <>
          <div className="mb-2 flex gap-1">
            {detail.types.map((t) => (
              <span
                key={t}
                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white ${TYPE_COLOR[t] ?? "bg-zinc-400"}`}
              >
                {TYPE_LABEL[t] ?? t}
              </span>
            ))}
          </div>
          <div className="mb-3">
            <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">種族値</div>
            {STAT_KEYS.map((k, i) => (
              <div key={k} className="mb-0.5 flex items-center gap-1.5">
                <span className="w-7 text-right text-[10px] font-extrabold text-zinc-400">{STAT_LABELS[i]}</span>
                <div className="h-1.5 flex-1 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${STAT_COLORS[i]}`}
                    style={{ width: `${(detail.baseStats[k] / 255) * 100}%` }}
                  />
                </div>
                <span className="w-7 text-right text-[11px] font-bold text-zinc-600">{detail.baseStats[k]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 性格 */}
      <div className="mb-2">
        <NatureSelect value={state.nature} onChange={(n) => set({ nature: n })} variant={variant} />
      </div>

      {/* 能力ポイント */}
      <div className="mb-2">
        <StatPointsForm value={state.statPoints} onChange={(sp) => set({ statPoints: sp })} variant={variant} />
      </div>

      {/* 特性・持ち物 */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <AbilitySelect
          abilities={detail?.abilities ?? []}
          value={state.abilityNameEn}
          onChange={(a) => set({ abilityNameEn: a })}
          variant={variant}
          disabled={!detail}
        />
        <ItemSelect value={state.itemNameEn} onChange={(i) => set({ itemNameEn: i })} variant={variant} />
      </div>

      {/* ランク補正 */}
      <div>
        <button
          onClick={() => setBoostOpen((o) => !o)}
          className="flex w-full items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-zinc-400"
        >
          ランク補正
          <span className="ml-1 text-[9px] font-normal normal-case tracking-normal text-zinc-300">
            （変化技・積み技の効果）
          </span>
          <span className="ml-auto">{boostOpen ? "▴" : "▾"}</span>
        </button>
        {boostOpen && (
          <div className="mt-2">
            <BoostForm value={state.boosts} onChange={(b) => set({ boosts: b })} variant={variant} />
          </div>
        )}
      </div>
    </div>
  );
}
