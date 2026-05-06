"use client";

import { AutoAttackResultDto, SkillDamageResultDto } from "../../application/dto";

type Props = {
  autoAttack: AutoAttackResultDto;
  skills: SkillDamageResultDto[];
};

const DAMAGE_TYPE_LABEL: Record<string, string> = {
  physical: "物理",
  magic: "魔法",
  true: "真",
};

function PhysicalBadge() {
  return (
    <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700">
      物理
    </span>
  );
}

export function DamageResultTable({ autoAttack, skills }: Props) {
  if (skills.length === 0) {
    return <div className="text-sm text-foreground text-center py-4">チャンピオンを選択してください</div>;
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
            <th className="text-right py-2 px-3 font-semibold">HP削減割合</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-2 px-3 font-bold">
              AA
              {autoAttack.onHitMagicPostMitigation !== null && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">オンヒット効果あり</span>
              )}
            </td>
            <td className="py-2 px-3"><PhysicalBadge /></td>
            <td className="py-2 px-3 text-right tabular-nums">{autoAttack.preMitigation}</td>
            <td className="py-2 px-3 text-right tabular-nums text-foreground">{autoAttack.effectiveResistance}</td>
            <td className="py-2 px-3 text-right tabular-nums font-semibold">{autoAttack.postMitigation}</td>
            <td className="py-2 px-3 text-right tabular-nums text-foreground">{autoAttack.reductionPercent}%</td>
            <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{autoAttack.hpPercent}%</td>
          </tr>
          {autoAttack.onHitMagicPostMitigation !== null && (
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3 font-bold">AA (オンヒット魔法)</td>
              <td className="py-2 px-3">
                <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">魔法</span>
              </td>
              <td className="py-2 px-3 text-right tabular-nums">—</td>
              <td className="py-2 px-3 text-right tabular-nums text-foreground">—</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold">{autoAttack.onHitMagicPostMitigation}</td>
              <td className="py-2 px-3 text-right tabular-nums text-foreground">—</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{autoAttack.onHitMagicHpPercent}%</td>
            </tr>
          )}
          {autoAttack.onHitPhysicalPostMitigation !== null && (
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3 font-bold">AA (オンヒット物理)</td>
              <td className="py-2 px-3"><PhysicalBadge /></td>
              <td className="py-2 px-3 text-right tabular-nums">—</td>
              <td className="py-2 px-3 text-right tabular-nums text-foreground">—</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold">{autoAttack.onHitPhysicalPostMitigation}</td>
              <td className="py-2 px-3 text-right tabular-nums text-foreground">—</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{autoAttack.onHitPhysicalHpPercent}%</td>
            </tr>
          )}
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-2 px-3 font-bold text-foreground">
              AA (クリット)
              {autoAttack.onHitMagicPostMitigation !== null && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">オンヒット効果あり</span>
              )}
            </td>
            <td className="py-2 px-3"><PhysicalBadge /></td>
            <td className="py-2 px-3 text-right tabular-nums text-foreground">
              {autoAttack.critPostMitigation !== null ? Math.round(autoAttack.preMitigation * 1.75) : "—"}
            </td>
            <td className="py-2 px-3 text-right tabular-nums text-foreground">{autoAttack.effectiveResistance}</td>
            <td className="py-2 px-3 text-right tabular-nums font-semibold">
              {autoAttack.critPostMitigation !== null ? autoAttack.critPostMitigation : "—"}
            </td>
            <td className="py-2 px-3 text-right tabular-nums text-foreground">
              {autoAttack.critPostMitigation !== null ? `${autoAttack.reductionPercent}%` : "—"}
            </td>
            <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">
              {autoAttack.critHpPercent !== null ? `${autoAttack.critHpPercent}%` : "—"}
            </td>
          </tr>
          {skills.map((s) => (
            <tr key={s.slot} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3">
                <span className="font-bold mr-2 uppercase">{s.slot}</span>
                <span className="text-foreground">{s.name}</span>
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
              <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.effectiveResistance}</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold">{s.postMitigation}</td>
              <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.reductionPercent}%</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{s.hpPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
