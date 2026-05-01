"use client";

import { SkillAllocationDto } from "../../application/dto";

type Props = {
  level: number;
  allocation: SkillAllocationDto;
  onChange: (alloc: SkillAllocationDto) => void;
};

const SLOTS = ["q", "w", "e", "r"] as const;
type Slot = typeof SLOTS[number];

const MAX_RANK = 5;

function maxRForLevel(level: number) {
  return Math.floor((level - 1) / 5);
}

export function SkillAllocationForm({ level, allocation, onChange }: Props) {
  const used = allocation.q + allocation.w + allocation.e + allocation.r;
  const remaining = level - used;

  function set(slot: Slot, rank: number) {
    onChange({ ...allocation, [slot]: rank });
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">スキル配分（残り: {remaining}）</div>
      {SLOTS.map((slot) => {
        const current = allocation[slot];
        const maxRank = slot === "r" ? maxRForLevel(level) : MAX_RANK;
        return (
          <div key={slot} className="flex items-center gap-2">
            <span className="w-4 text-sm font-bold uppercase">{slot}</span>
            <div className="flex gap-1">
              {Array.from({ length: maxRank }, (_, i) => i + 1).map((rank) => {
                const isActive = rank <= current;
                const canAdd = rank > current && remaining > 0;
                const canClick = isActive || canAdd;
                return (
                  <button
                    key={rank}
                    onClick={() => canClick && set(slot, isActive && rank === current ? rank - 1 : rank)}
                    className={[
                      "w-7 h-7 rounded text-xs font-semibold border transition-colors",
                      isActive
                        ? "bg-blue-500 text-white border-blue-600"
                        : canAdd
                        ? "bg-white border-gray-300 hover:bg-blue-50"
                        : "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed",
                    ].join(" ")}
                    disabled={!canClick}
                  >
                    {rank}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
