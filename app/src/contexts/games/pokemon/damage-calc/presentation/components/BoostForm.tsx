"use client";

import { StatBoostsDto } from "../../application/dto";

const STATS: { key: keyof StatBoostsDto; label: string }[] = [
  { key: "attack",    label: "こう" },
  { key: "defense",   label: "ぼう" },
  { key: "spAttack",  label: "とく" },
  { key: "spDefense", label: "とぼ" },
  { key: "speed",     label: "すば" },
];

interface Props {
  value: StatBoostsDto;
  onChange: (b: StatBoostsDto) => void;
  variant: "atk" | "def";
}

export default function BoostForm({ value, onChange, variant }: Props) {
  const accent = variant === "atk" ? "border-orange-300 hover:bg-orange-50" : "border-emerald-300 hover:bg-emerald-50";
  const change = (key: keyof StatBoostsDto, delta: number) => {
    const next = Math.max(-6, Math.min(6, value[key] + delta));
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="grid grid-cols-5 gap-1">
      {STATS.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-extrabold uppercase text-zinc-400">{label}</span>
          <div className={`flex items-center rounded-lg border bg-white overflow-hidden w-full ${accent}`}>
            <button
              onClick={() => change(key, -1)}
              className="px-1 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              −
            </button>
            <span
              className={`flex-1 text-center text-[12px] font-extrabold ${
                value[key] > 0 ? "text-red-500" : value[key] < 0 ? "text-blue-500" : "text-zinc-700"
              }`}
            >
              {value[key] > 0 ? `+${value[key]}` : value[key]}
            </span>
            <button
              onClick={() => change(key, 1)}
              className="px-1 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              ＋
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
