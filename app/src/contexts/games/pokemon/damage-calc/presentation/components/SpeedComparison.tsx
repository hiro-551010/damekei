"use client";

import { calcActualSpeed } from "../utils/speedCalc";
import { PokemonDetailDto } from "../../application/dto";
import { PokemonState } from "./PokemonPanel";

interface Props {
  atkState: PokemonState;
  defState: PokemonState;
  atkDetail: PokemonDetailDto | null;
  defDetail: PokemonDetailDto | null;
}

export default function SpeedComparison({ atkState, defState, atkDetail, defDetail }: Props) {
  if (!atkDetail || !defDetail) return null;

  const atkSpeed = calcActualSpeed(
    atkDetail.baseStats.speed,
    atkState.statPoints.speed,
    atkState.nature,
    atkState.boosts.speed,
    atkState.itemNameEn,
  );
  const defSpeed = calcActualSpeed(
    defDetail.baseStats.speed,
    defState.statPoints.speed,
    defState.nature,
    defState.boosts.speed,
    defState.itemNameEn,
  );

  const tie = atkSpeed === defSpeed;
  const atkFirst = atkSpeed > defSpeed;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
        ⚡ 素早さ比較
      </div>

      <div className="flex items-center gap-2">
        {/* 攻撃側 */}
        <div className={`flex-1 rounded-xl px-3 py-2 text-center ${atkFirst || tie ? "bg-orange-50 ring-1 ring-orange-300" : "bg-zinc-50"}`}>
          <div className="text-[9px] font-bold text-orange-400 mb-0.5">攻撃側</div>
          <div className="text-[20px] font-black text-zinc-800 leading-none">{atkSpeed}</div>
        </div>

        {/* 判定 */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          {tie ? (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-extrabold text-zinc-500">同速</span>
          ) : atkFirst ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-extrabold text-orange-600">先攻</span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">後攻</span>
          )}
        </div>

        {/* 防御側 */}
        <div className={`flex-1 rounded-xl px-3 py-2 text-center ${!atkFirst || tie ? "bg-emerald-50 ring-1 ring-emerald-300" : "bg-zinc-50"}`}>
          <div className="text-[9px] font-bold text-emerald-500 mb-0.5">防御側</div>
          <div className="text-[20px] font-black text-zinc-800 leading-none">{defSpeed}</div>
        </div>
      </div>
    </div>
  );
}
