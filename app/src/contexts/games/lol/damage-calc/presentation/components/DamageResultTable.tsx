"use client";

import {
  AutoAttackResultDto,
  ChampionPassiveAAResultDto,
  ChampionStateResultDto,
  SkillDamageResultDto,
} from "../../application/dto";

type Props = {
  autoAttack: AutoAttackResultDto;
  skills: SkillDamageResultDto[];
  championPassiveAA?: ChampionPassiveAAResultDto;
  stateResults?: ChampionStateResultDto[];
};

const DAMAGE_TYPE_LABEL: Record<string, string> = {
  physical: "物理",
  magic: "魔法",
  true: "真",
};

function DamageTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    physical: "bg-orange-100 text-orange-700",
    magic: "bg-blue-100 text-blue-700",
    true: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${styles[type] ?? ""}`}>
      {DAMAGE_TYPE_LABEL[type] ?? type}
    </span>
  );
}

type TableRowsProps = {
  autoAttack: AutoAttackResultDto;
  skills: SkillDamageResultDto[];
  championPassiveAA?: ChampionPassiveAAResultDto;
};

function TableRows({ autoAttack, skills, championPassiveAA }: TableRowsProps) {
  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-2 px-3 font-bold">
          AA
          {autoAttack.onHitMagicPostMitigation !== null && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">オンヒット効果あり</span>
          )}
        </td>
        <td className="py-2 px-3"><DamageTypeBadge type="physical" /></td>
        <td className="py-2 px-3 text-right tabular-nums">{autoAttack.preMitigation}</td>
        <td className="py-2 px-3 text-right tabular-nums text-foreground">{autoAttack.effectiveResistance}</td>
        <td className="py-2 px-3 text-right tabular-nums font-semibold">{autoAttack.postMitigation}</td>
        <td className="py-2 px-3 text-right tabular-nums text-foreground">{autoAttack.reductionPercent}%</td>
        <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{autoAttack.hpPercent}%</td>
      </tr>
      {autoAttack.onHitMagicPostMitigation !== null && (
        <tr className="border-b border-gray-100 hover:bg-gray-50">
          <td className="py-2 px-3 font-bold">AA (オンヒット魔法)</td>
          <td className="py-2 px-3"><DamageTypeBadge type="magic" /></td>
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
          <td className="py-2 px-3"><DamageTypeBadge type="physical" /></td>
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
        <td className="py-2 px-3"><DamageTypeBadge type="physical" /></td>
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
      {championPassiveAA && (
        <tr className="border-b border-gray-100 hover:bg-gray-50">
          <td className="py-2 px-3 font-bold">AA (パッシブ)</td>
          <td className="py-2 px-3"><DamageTypeBadge type={championPassiveAA.damageType} /></td>
          <td className="py-2 px-3 text-right tabular-nums">{championPassiveAA.preMitigation}</td>
          <td className="py-2 px-3 text-right tabular-nums text-foreground">{championPassiveAA.effectiveResistance}</td>
          <td className="py-2 px-3 text-right tabular-nums font-semibold">{championPassiveAA.postMitigation}</td>
          <td className="py-2 px-3 text-right tabular-nums text-foreground">{championPassiveAA.reductionPercent}%</td>
          <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{championPassiveAA.hpPercent}%</td>
        </tr>
      )}
      {skills.map((s) => (
        <>
          <tr key={s.slot} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-2 px-3">
              <span className="font-bold mr-2 uppercase">{s.slot}</span>
              <span className="text-foreground">{s.name}</span>
            </td>
            <td className="py-2 px-3"><DamageTypeBadge type={s.damageType} /></td>
            <td className="py-2 px-3 text-right tabular-nums">{s.preMitigation}</td>
            <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.effectiveResistance}</td>
            <td className="py-2 px-3 text-right tabular-nums font-semibold">{s.postMitigation}</td>
            <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.reductionPercent}%</td>
            <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{s.hpPercent}%</td>
          </tr>
          {s.variants?.map((v) => (
            <tr key={`${s.slot}-${v.name}`} className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50">
              <td className="py-2 px-3 pl-6 text-foreground">
                <span className="font-bold mr-2 uppercase">{s.slot}</span>
                <span>{v.name}</span>
              </td>
              <td className="py-2 px-3"><DamageTypeBadge type={s.damageType} /></td>
              <td className="py-2 px-3 text-right tabular-nums">{v.preMitigation}</td>
              <td className="py-2 px-3 text-right tabular-nums text-foreground">{v.effectiveResistance}</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold">{v.postMitigation}</td>
              <td className="py-2 px-3 text-right tabular-nums text-foreground">{v.reductionPercent}%</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600">{v.hpPercent}%</td>
            </tr>
          ))}
        </>
      ))}
    </>
  );
}

export function DamageResultTable({ autoAttack, skills, championPassiveAA, stateResults }: Props) {
  if (skills.length === 0) {
    return <div className="text-sm text-foreground text-center py-4">チャンピオンを選択してください</div>;
  }

  const tableHead = (
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
  );

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {tableHead}
          <tbody>
            <TableRows autoAttack={autoAttack} skills={skills} championPassiveAA={championPassiveAA} />
          </tbody>
        </table>
      </div>

      {stateResults?.map((state) => (
        <div key={state.stateName}>
          <h3 className="font-semibold text-base mb-2 text-foreground">
            {state.stateName}（ランク {state.rank}）発動中
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {tableHead}
              <tbody>
                <TableRows
                  autoAttack={state.autoAttack}
                  skills={state.skills}
                  championPassiveAA={state.championPassiveAA}
                />
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
