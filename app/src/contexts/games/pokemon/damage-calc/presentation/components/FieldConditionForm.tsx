"use client";

import { useState } from "react";

interface FieldCondition {
  weather: "sun" | "rain" | "sand" | "snow" | null;
  terrain: "electric" | "grassy" | "misty" | "psychic" | null;
}

interface Props {
  value: FieldCondition;
  onChange: (f: FieldCondition) => void;
}

const WEATHERS: { value: FieldCondition["weather"]; label: string }[] = [
  { value: null,   label: "なし" },
  { value: "sun",  label: "☀ 晴" },
  { value: "rain", label: "🌧 雨" },
  { value: "sand", label: "🌪 砂" },
  { value: "snow", label: "❄ 雪" },
];

const TERRAINS: { value: FieldCondition["terrain"]; label: string }[] = [
  { value: null,       label: "なし" },
  { value: "electric", label: "⚡エレキ" },
  { value: "grassy",   label: "🌿グラス" },
  { value: "misty",    label: "🌀ミスト" },
  { value: "psychic",  label: "🔮サイコ" },
];

export default function FieldConditionForm({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1 text-left text-[11px] font-bold text-zinc-500"
      >
        <span>🌤 フィールド状態</span>
        <span className="ml-auto text-[10px] text-zinc-400">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wide text-zinc-400">天候</div>
            <div className="flex flex-wrap gap-1">
              {WEATHERS.map((w) => (
                <button
                  key={String(w.value)}
                  onClick={() => onChange({ ...value, weather: w.value })}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    value.weather === w.value
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wide text-zinc-400">テレイン</div>
            <div className="flex flex-wrap gap-1">
              {TERRAINS.map((t) => (
                <button
                  key={String(t.value)}
                  onClick={() => onChange({ ...value, terrain: t.value })}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    value.terrain === t.value
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
