"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PokemonListItemDto, PokemonDetailDto, DamageResultDto } from "../application/dto";
import { getPokemonDetail, calculateDamage } from "../application/use-cases";
import { pokemonRepository, damageCalculator } from "../infrastructure/container";
import PokemonPanel, { DEFAULT_BOOSTS, DEFAULT_SP, PokemonState } from "./components/PokemonPanel";
import MoveSelect from "./components/MoveSelect";
import FieldConditionForm from "./components/FieldConditionForm";
import { calcActualSpeed } from "./utils/speedCalc";
import SaveBuildButton from "@/contexts/builds/presentation/components/SaveBuildButton";
import { BuildDetailDto, BuildSlotDto } from "@/contexts/builds/application/dto";

interface Props {
  pokemonList: PokemonListItemDto[];
  isLoggedIn: boolean;
  appUrl: string;
  initialBuild: BuildDetailDto | null;
}

const DEFAULT_STATE: PokemonState = {
  pokemonId: null,
  nature: "hardy",
  statPoints: DEFAULT_SP,
  abilityNameEn: "",
  itemNameEn: "",
  boosts: DEFAULT_BOOSTS,
};

type AtkSlot = { state: PokemonState; detail: PokemonDetailDto | null; moveNameEn: string };

const DEFAULT_SLOT: AtkSlot = { state: DEFAULT_STATE, detail: null, moveNameEn: "" };

const KO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  guaranteed:    { bg: "bg-red-100",    text: "text-red-700",    label: "確定一発" },
  high:          { bg: "bg-orange-100", text: "text-orange-700", label: "高乱数一発" },
  low:           { bg: "bg-blue-100",   text: "text-blue-700",   label: "低乱数一発" },
  guaranteed_no: { bg: "bg-zinc-100",   text: "text-zinc-600",   label: "確定耐え" },
};

function buildToSlots(build: BuildDetailDto, pokemonList: PokemonListItemDto[]): [AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot] {
  return Array.from({ length: 6 }, (_, i) => {
    const s = build.slots.find((sl) => sl.slotIndex === i);
    if (!s || s.pokemonId === null) return DEFAULT_SLOT;
    const detail = (() => {
      const p = pokemonList.find((p) => p.id === s.pokemonId);
      if (!p) return null;
      // detail は後続の useEffect で取得されるため null で初期化
      return null;
    })();
    return {
      state: {
        pokemonId: s.pokemonId,
        nature: s.nature,
        statPoints: s.statPoints,
        abilityNameEn: s.abilityNameEn,
        itemNameEn: s.itemNameEn,
        boosts: s.boosts,
      },
      detail,
      moveNameEn: s.moveNameEn,
    };
  }) as [AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot];
}

export default function DamageCalcPage({ pokemonList, isLoggedIn, appUrl, initialBuild }: Props) {
  const initialSlots = initialBuild ? buildToSlots(initialBuild, pokemonList) : null;

  // 攻撃側 6枠タブ
  const [slots, setSlots] = useState<[AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot]>(
    initialSlots ?? [DEFAULT_SLOT, DEFAULT_SLOT, DEFAULT_SLOT, DEFAULT_SLOT, DEFAULT_SLOT, DEFAULT_SLOT]
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const isSlotSwitch = useRef(false);

  const [atk, setAtk] = useState<PokemonState>(DEFAULT_STATE);
  const [def, setDef] = useState<PokemonState>(DEFAULT_STATE);
  const [atkDetail, setAtkDetail] = useState<PokemonDetailDto | null>(null);
  const [defDetail, setDefDetail] = useState<PokemonDetailDto | null>(null);
  const [moveNameEn, setMoveNameEn] = useState("");
  const [hitCount, setHitCount] = useState<number | null>(null);
  const [field, setField] = useState({ weather: null as "sun" | "rain" | "sand" | "snow" | null, terrain: null as "electric" | "grassy" | "misty" | "psychic" | null });
  const [result, setResult] = useState<DamageResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 攻撃側ポケモン変更（スロット切り替え時はスキップ）
  useEffect(() => {
    if (isSlotSwitch.current) { isSlotSwitch.current = false; return; }
    if (!atk.pokemonId) { setAtkDetail(null); setMoveNameEn(""); return; }
    const d = getPokemonDetail(pokemonRepository, atk.pokemonId);
    setAtkDetail(d);
    setAtk((s) => ({ ...s, abilityNameEn: d.abilities[0]?.nameEn ?? "" }));
    setMoveNameEn("");
    setHitCount(null);
  }, [atk.pokemonId]);

  useEffect(() => {
    if (!def.pokemonId) { setDefDetail(null); return; }
    const d = getPokemonDetail(pokemonRepository, def.pokemonId);
    setDefDetail(d);
    setDef((s) => ({ ...s, abilityNameEn: d.abilities[0]?.nameEn ?? "" }));
  }, [def.pokemonId]);

  useEffect(() => {
    if (!atk.pokemonId || !def.pokemonId || !moveNameEn || !atk.abilityNameEn || !def.abilityNameEn) {
      setResult(null);
      return;
    }
    try {
      const r = calculateDamage(pokemonRepository, damageCalculator, {
        attacker: { pokemonId: atk.pokemonId, nature: atk.nature, statPoints: atk.statPoints, abilityNameEn: atk.abilityNameEn, itemNameEn: atk.itemNameEn || null, boosts: atk.boosts },
        defender: { pokemonId: def.pokemonId, nature: def.nature, statPoints: def.statPoints, abilityNameEn: def.abilityNameEn, itemNameEn: def.itemNameEn || null, boosts: def.boosts },
        moveNameEn,
        hitCount: hitCount ?? undefined,
        field,
      });
      setResult(r);
      setError(null);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [atk, def, moveNameEn, hitCount, field]);

  const switchSlot = (newIndex: number) => {
    if (newIndex === activeSlot) return;
    // 現在のスロットに状態を保存
    setSlots((prev) => {
      const next = [...prev] as [AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot, AtkSlot];
      next[activeSlot] = { state: atk, detail: atkDetail, moveNameEn };
      return next;
    });
    // 新しいスロットを復元（pokemonId effect をスキップ）
    const target = slots[newIndex];
    isSlotSwitch.current = true;
    setActiveSlot(newIndex);
    setAtk(target.state);
    setAtkDetail(target.detail);
    setMoveNameEn(target.moveNameEn);
    setHitCount(null);
    setResult(null);
  };

  const swap = () => {
    setAtk(def);
    setDef(atk);
    setAtkDetail(defDetail);
    setDefDetail(atkDetail);
    setMoveNameEn("");
  };

  const atkMoves = useMemo(() => atkDetail?.moves ?? [], [atkDetail]);

  const currentSlotsAsDto: BuildSlotDto[] = slots.map((slot, i) => ({
    slotIndex: i,
    pokemonId: slot.state.pokemonId,
    nature: slot.state.nature,
    statPoints: slot.state.statPoints,
    abilityNameEn: slot.state.abilityNameEn,
    itemNameEn: slot.state.itemNameEn,
    boosts: slot.state.boosts,
    moveNameEn: i === activeSlot ? moveNameEn : slot.moveNameEn,
  }));

  const atkSpeed = atkDetail
    ? calcActualSpeed(atkDetail.baseStats.speed, atk.statPoints.speed, atk.nature, atk.boosts.speed, atk.itemNameEn)
    : null;
  const defSpeed = defDetail
    ? calcActualSpeed(defDetail.baseStats.speed, def.statPoints.speed, def.nature, def.boosts.speed, def.itemNameEn)
    : null;

  const speedVerdict =
    atkSpeed !== null && defSpeed !== null
      ? atkSpeed > defSpeed ? "先攻"
      : atkSpeed < defSpeed ? "後攻"
      : "同速"
      : null;

  const ko = result ? KO_STYLE[result.knockoutChance] : null;

  return (
    <div className="min-h-screen" style={{ background: "#FFFAF3" }}>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
        <span className="font-sans text-xl font-black" style={{ background: "linear-gradient(135deg,#FF6B45,#FF9E42)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          ダメけい！
        </span>
        <span className="rounded-full bg-gradient-to-r from-orange-400 to-orange-300 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">β</span>
        <div className="ml-auto flex items-center gap-2">
          <SaveBuildButton slots={currentSlotsAsDto} isLoggedIn={isLoggedIn} appUrl={appUrl} />
          {isLoggedIn ? (
            <a href="/my-builds" className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600">マイ構築</a>
          ) : (
            <a href="/auth/login" className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600">ログイン</a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-4 flex flex-col gap-3">
        <div className="flex gap-3 items-start">
          {/* 攻撃側 */}
          <div className="flex-1 min-w-0">
            {/* タブ */}
            <div className="mb-2 flex gap-1">
              {slots.map((slot, i) => {
                const pokemon = slot.state.pokemonId
                  ? pokemonList.find((p) => p.id === slot.state.pokemonId)
                  : null;
                const isActive = i === activeSlot;
                return (
                  <button
                    key={i}
                    onClick={() => switchSlot(i)}
                    className={`flex-1 truncate rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${
                      isActive
                        ? "bg-orange-500 text-white shadow-sm"
                        : "border border-zinc-200 bg-white text-zinc-400 hover:border-orange-300 hover:text-orange-500"
                    }`}
                  >
                    {pokemon ? pokemon.name : `枠 ${i + 1}`}
                  </button>
                );
              })}
            </div>
            <PokemonPanel variant="atk" state={atk} onChange={setAtk} pokemonList={pokemonList} detail={atkDetail} />
          </div>

          {/* 中央列 */}
          <div className="w-52 shrink-0 flex flex-col gap-2 pt-9">
            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <MoveSelect moves={atkMoves} value={moveNameEn} onChange={(v) => { setMoveNameEn(v); setHitCount(null); }} disabled={!atkDetail} />
            </div>

            <FieldConditionForm value={field} onChange={setField} />

            {/* 素早さ比較 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wide text-zinc-400">⚡ 素早さ</div>
              {atkSpeed !== null && defSpeed !== null ? (
                <div className="flex items-center gap-1.5">
                  <div className={`flex-1 rounded-lg py-1.5 text-center ${atkSpeed >= defSpeed ? "bg-orange-50 ring-1 ring-orange-200" : "bg-zinc-50"}`}>
                    <div className="text-[18px] font-black leading-none text-zinc-800">{atkSpeed}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                    speedVerdict === "先攻" ? "bg-orange-100 text-orange-600" :
                    speedVerdict === "後攻" ? "bg-emerald-100 text-emerald-600" :
                    "bg-zinc-100 text-zinc-500"
                  }`}>{speedVerdict}</span>
                  <div className={`flex-1 rounded-lg py-1.5 text-center ${defSpeed >= atkSpeed ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-zinc-50"}`}>
                    <div className="text-[18px] font-black leading-none text-zinc-800">{defSpeed}</div>
                  </div>
                </div>
              ) : (
                <div className="py-1 text-center text-[11px] text-zinc-300">— vs —</div>
              )}
            </div>

            {/* ヒット数セレクタ（複数回攻撃技のみ表示） */}
            {result && result.hitCount > 1 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                <div className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wide text-zinc-400">🎯 ヒット数</div>
                <div className="flex gap-1">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setHitCount(hitCount === n ? null : n)}
                      className={`flex-1 rounded-lg py-1.5 text-[12px] font-extrabold transition-colors ${
                        (hitCount === n) || (hitCount === null && n === result.hitCount)
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-100 text-zinc-500 hover:bg-orange-100 hover:text-orange-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ダメージ結果 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-zinc-400">📊 ダメージ</span>
                {ko && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${ko.bg} ${ko.text}`}>{ko.label}</span>
                )}
              </div>
              {result ? (
                <>
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <div className="text-[17px] font-black leading-tight text-zinc-900">{result.min} 〜 {result.max}</div>
                      {result.hitCount > 1 && (
                        <span className="text-[10px] font-extrabold text-orange-400">×{result.hitCount}hit</span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold">
                      <span className="text-orange-500">{result.minPercent}%</span>
                      <span className="text-zinc-400"> 〜 </span>
                      <span className="text-orange-500">{result.maxPercent}%</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500"
                      style={{ width: `${Math.min(result.maxPercent, 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="py-1 text-center text-[13px] font-black text-zinc-200">— 〜 —</div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                {error}
              </div>
            )}

            {/* スワップ */}
            <div className="flex justify-center">
              <button
                onClick={swap}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-base text-zinc-500 shadow-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
                title="攻撃側 ⇄ 防御側 を入れ替え"
              >
                ⇅
              </button>
            </div>
          </div>

          {/* 防御側 */}
          <div className="flex-1 min-w-0">
            <PokemonPanel variant="def" state={def} onChange={setDef} pokemonList={pokemonList} detail={defDetail} />
          </div>
        </div>
      </main>
    </div>
  );
}
