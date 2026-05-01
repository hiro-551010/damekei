"use client";

import { StatPointsDto } from "../../application/dto";

const STATS: { key: keyof StatPointsDto; label: string }[] = [
  { key: "hp",        label: "HP"   },
  { key: "attack",    label: "こう" },
  { key: "defense",   label: "ぼう" },
  { key: "spAttack",  label: "とく" },
  { key: "spDefense", label: "とぼ" },
  { key: "speed",     label: "すば" },
];

const SLIDER_CSS = `
  input[type="range"].sp-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    outline: none;
  }
  input[type="range"].sp-slider::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 9999px;
    background: linear-gradient(
      to right,
      var(--sp-accent) var(--sp-fill, 0%),
      #e4e4e7 var(--sp-fill, 0%)
    );
  }
  input[type="range"].sp-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--sp-accent);
    cursor: pointer;
    margin-top: -5px;
  }
  input[type="range"].sp-slider::-moz-range-track {
    height: 6px;
    border-radius: 9999px;
    background-color: #e4e4e7;
  }
  input[type="range"].sp-slider::-moz-range-progress {
    height: 6px;
    border-radius: 9999px;
    background-color: var(--sp-accent);
  }
  input[type="range"].sp-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--sp-accent);
    border: none;
    cursor: pointer;
  }
`;

interface Props {
  value: StatPointsDto;
  onChange: (sp: StatPointsDto) => void;
  variant: "atk" | "def";
}

export default function StatPointsForm({ value, onChange, variant }: Props) {
  const total = Object.values(value).reduce((s, v) => s + v, 0);
  const remaining = 66 - total;
  const accent = variant === "atk" ? "#FF6B45" : "#22B574";

  const update = (key: keyof StatPointsDto, v: number) => {
    onChange({ ...value, [key]: Math.max(0, Math.min(32, v)) });
  };

  return (
    <div>
      <style>{SLIDER_CSS}</style>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
          能力ポイント（SP）
        </span>
        <span
          className={`text-[10px] font-bold ${remaining < 0 ? "text-red-500" : "text-zinc-400"}`}
        >
          {remaining < 0 ? `超過 ${Math.abs(remaining)}` : `残り ${remaining}`}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {STATS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-7 text-right text-[10px] font-extrabold text-zinc-400 shrink-0">
              {label}
            </span>
            <input
              type="range"
              min={0}
              max={32}
              value={value[key]}
              onChange={(e) => update(key, Number(e.target.value))}
              className="sp-slider flex-1 h-1.5 cursor-pointer"
              style={{
                "--sp-accent": accent,
                "--sp-fill": `${(value[key] / 32) * 100}%`,
              } as React.CSSProperties}
            />
            <span
              className={`w-6 text-right text-[11px] font-extrabold shrink-0 ${
                value[key] === 32 ? "text-orange-500" : "text-zinc-700"
              }`}
              style={{ color: value[key] === 32 ? accent : undefined }}
            >
              {value[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
