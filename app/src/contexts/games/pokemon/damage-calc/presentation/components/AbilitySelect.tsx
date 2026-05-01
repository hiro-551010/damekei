"use client";

import { AbilityDto } from "../../application/dto";

interface Props {
  abilities: AbilityDto[];
  value: string;
  onChange: (nameEn: string) => void;
  variant: "atk" | "def";
  disabled?: boolean;
}

export default function AbilitySelect({ abilities, value, onChange, variant, disabled }: Props) {
  const accent = variant === "atk" ? "focus:border-orange-400" : "focus:border-emerald-400";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-zinc-500">特性</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[13px] font-bold text-zinc-800 outline-none disabled:opacity-40 ${accent}`}
      >
        {abilities.map((a) => (
          <option key={a.nameEn} value={a.nameEn}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
