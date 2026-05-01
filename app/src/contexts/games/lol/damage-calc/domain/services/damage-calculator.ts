import { Champion, ComputedStats, DamageResult, SkillDamageResult } from "../models";
import { computeStats } from "./stats-computer";
import { SkillSlot } from "../types";

function effectiveArmor(targetArmor: number, attacker: ComputedStats): number {
  const afterPercent = targetArmor * (1 - attacker.armorPenPercent / 100);
  const afterFlat = afterPercent - attacker.lethality;
  return Math.max(0, afterFlat);
}

function effectiveMagicResist(targetMR: number, attacker: ComputedStats): number {
  const afterPercent = targetMR * (1 - attacker.magicPenPercent / 100);
  const afterFlat = afterPercent - attacker.magicPenFlat;
  return Math.max(0, afterFlat);
}

function mitigate(preMitigation: number, resistance: number): number {
  return preMitigation * (100 / (100 + resistance));
}

function skillRank(slot: SkillSlot, alloc: Champion["skillAllocation"]): number {
  return alloc[slot.toLowerCase() as "q" | "w" | "e" | "r"];
}

export function calculateDamage(attacker: Champion, defender: Champion): DamageResult {
  const atkStats = computeStats(attacker);
  const defStats = computeStats(defender);

  const skills: SkillDamageResult[] = attacker.species.skills.map((spec) => {
    const rank = skillRank(spec.slot, attacker.skillAllocation);

    if (rank === 0) {
      return {
        slot: spec.slot,
        name: spec.name,
        damageType: spec.damageType,
        preMitigation: 0,
        effectiveResistance: 0,
        postMitigation: 0,
        reductionPercent: 0,
      };
    }

    const rankIndex = rank - 1;
    const baseDmg = spec.baseDamageByRank[rankIndex] ?? 0;
    const preMitigation =
      baseDmg +
      spec.totalAdRatio * atkStats.totalAd +
      spec.bonusAdRatio * atkStats.bonusAd +
      spec.apRatio * atkStats.ap;

    let effectiveResistance: number;
    if (spec.damageType === "physical") {
      effectiveResistance = effectiveArmor(defStats.armor, atkStats);
    } else if (spec.damageType === "magic") {
      effectiveResistance = effectiveMagicResist(defStats.magicResist, atkStats);
    } else {
      effectiveResistance = 0;
    }

    const postMitigation = spec.damageType === "true"
      ? preMitigation
      : mitigate(preMitigation, effectiveResistance);

    const reductionPercent = preMitigation > 0
      ? ((preMitigation - postMitigation) / preMitigation) * 100
      : 0;

    return {
      slot: spec.slot,
      name: spec.name,
      damageType: spec.damageType,
      preMitigation: Math.round(preMitigation),
      effectiveResistance: Math.round(effectiveResistance * 10) / 10,
      postMitigation: Math.round(postMitigation),
      reductionPercent: Math.round(reductionPercent * 10) / 10,
    };
  });

  return { skills };
}
