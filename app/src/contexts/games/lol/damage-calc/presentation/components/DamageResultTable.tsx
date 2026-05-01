"use client";

import { SkillDamageResultDto } from "../../application/dto";

type Props = {
  skills: SkillDamageResultDto[];
};

const DAMAGE_TYPE_LABEL: Record<string, string> = {
  physical: "物理",
  magic: "魔法",
  true: "真",
};

export function DamageResultTable({ skills }: Props) {
  if (skills.length === 0) {
    return <div className="text-sm text-gray-400 text-center py-4">チャンピオンを選択してください</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-semibold">スキル</th>
            <th className="text-left py-2 px-3 font-semibold">種類</th>
            <th className="text-right py-2 px-3 font-semibold">ダメージ（軽減前）</th>
            <th className="text-right py-2 px-3 font-semibold">実効耐性</th>
            <th className="text-right py-2 px-3 font-semibold">ダメージ（軽減後）</th>
            <th className="text-right py-2 px-3 font-semibold">軽減率</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s) => (
            <tr key={s.slot} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3">
                <span className="font-bold mr-2 uppercase">{s.slot}</span>
                <span className="text-gray-600">{s.name}</span>
              </td>
              <td className="py-2 px-3">
                <span
                  className={[
                    "px-1.5 py-0.5 rounded text-xs font-semibold",
                    s.damageType === "physical" && "bg-orange-100 text-orange-700",
                    s.damageType === "magic" && "bg-blue-100 text-blue-700",
                    s.damageType === "true" && "bg-gray-100 text-gray-700",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {DAMAGE_TYPE_LABEL[s.damageType]}
                </span>
              </td>
              <td className="py-2 px-3 text-right tabular-nums">{s.preMitigation}</td>
              <td className="py-2 px-3 text-right tabular-nums text-gray-500">{s.effectiveResistance}</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold">{s.postMitigation}</td>
              <td className="py-2 px-3 text-right tabular-nums text-gray-500">{s.reductionPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
