"use client";

import { useState } from "react";
import { DamageResultDto } from "../../application/dto";

interface Props {
  result: DamageResultDto | null;
}

const KO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  guaranteed: { bg: "bg-red-100",    text: "text-red-700",    label: "確定一発" },
  high:       { bg: "bg-orange-100", text: "text-orange-700", label: "高乱数一発" },
  low:        { bg: "bg-blue-100",   text: "text-blue-700",   label: "低乱数一発" },
  guaranteed_no: { bg: "bg-zinc-100", text: "text-zinc-600",  label: "確定耐え" },
};

export default function DamageResultDisplay({ result }: Props) {
  const [rollsOpen, setRollsOpen] = useState(false);

  const ko = result ? KO_STYLE[result.knockoutChance] : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
          📊 計算結果
        </span>
        {ko && (
          <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${ko.bg} ${ko.text}`}>
            {ko.label}
          </span>
        )}
      </div>

      {!result ? (
        <div className="flex flex-col items-center gap-2 py-6 text-zinc-300">
          <div className="font-sans text-4xl font-black tracking-tight">— 〜 —</div>
          <div className="text-sm font-bold">ポケモンとわざを選択すると計算されます</div>
          <div className="mt-2 h-2.5 w-full rounded-full bg-zinc-100" />
        </div>
      ) : (
        <>
          <div className="mb-4 text-center">
            <div className="font-sans text-4xl font-black tracking-tight text-zinc-900">
              {result.min} 〜 {result.max}
            </div>
            <div className="mt-1 text-base font-bold text-zinc-500">
              <span className="font-black text-orange-500">{result.minPercent}%</span>
              {" 〜 "}
              <span className="font-black text-orange-500">{result.maxPercent}%</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-1 flex justify-between text-[10px] font-semibold text-zinc-400">
              <span>0%</span>
              <span>最大HP (100%)</span>
            </div>
            <div className="relative h-2.5 overflow-visible rounded-full bg-zinc-100">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500 transition-all duration-300"
                style={{ left: 0, width: `${Math.min(result.maxPercent, 100)}%` }}
              />
              <div
                className="absolute bottom-[-3px] top-[-3px] w-0.5 rounded bg-zinc-800"
                style={{ left: "100%" }}
              />
            </div>
          </div>

          <button
            onClick={() => setRollsOpen((o) => !o)}
            className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-zinc-400 transition-colors hover:bg-zinc-50"
          >
            {rollsOpen ? "▴ 乱数詳細を閉じる" : "▾ 乱数詳細（16通り）"}
          </button>

          {rollsOpen && (
            <div className="mt-2 grid grid-cols-8 gap-1">
              {result.rolls.map((r, i) => {
                const isKo = result.percentages[i] >= 100;
                return (
                  <div
                    key={i}
                    className={`rounded-md py-1 text-center text-[11px] font-bold ${
                      isKo ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {r}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
