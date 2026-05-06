import { AutoAttackResult, Champion, ComputedStats, DamageResult, SkillDamageResult } from "../models";
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

function calculateAutoAttack(attacker: Champion, atkStats: ComputedStats, defStats: ComputedStats): AutoAttackResult {
  const effArmor = effectiveArmor(defStats.armor, atkStats);
  const preMitigation = atkStats.totalAd;
  const postMitigation = mitigate(preMitigation, effArmor);
  const reductionPercent = preMitigation > 0
    ? ((preMitigation - postMitigation) / preMitigation) * 100
    : 0;
  const hpPercent = defStats.hp > 0 ? (postMitigation / defStats.hp) * 100 : 0;

  const hasCrit = atkStats.critChance > 0;
  const bonusCritFactor = attacker.items
    .flatMap((i) => i.passives)
    .reduce((sum, p) => {
      if (p.kind !== "critDamageAmp") return sum;
      if (atkStats.critChance < p.minCritChance) return sum;
      return sum + p.bonusFactor;
    }, 0);
  const critMultiplier = 1.75 + bonusCritFactor;
  const critPreMitigation = atkStats.totalAd * critMultiplier;
  const critPostMitigation = hasCrit ? mitigate(critPreMitigation, effArmor) : null;
  const critHpPercent = hasCrit && defStats.hp > 0
    ? (critPostMitigation! / defStats.hp) * 100
    : null;

  const onHitMagicFlat = attacker.items
    .flatMap((i) => i.passives)
    .filter((p) => p.kind === "onHitMagicDamage")
    .reduce((sum, p) => sum + (p as { kind: "onHitMagicDamage"; damage: number }).damage, 0);
  const onHitMagicScaled = attacker.items
    .flatMap((i) => i.passives)
    .filter((p) => p.kind === "onHitMagicDamageScaled")
    .reduce((sum, p) => {
      const { base, apRatio } = p as { kind: "onHitMagicDamageScaled"; base: number; apRatio: number };
      return sum + base + apRatio * atkStats.ap;
    }, 0);
  const onHitPreMitigation = onHitMagicFlat + onHitMagicScaled;
  const effMR = effectiveMagicResist(defStats.magicResist, atkStats);
  const onHitMagicPostMitigation = onHitPreMitigation > 0
    ? Math.round(mitigate(onHitPreMitigation, effMR))
    : null;
  const onHitMagicHpPercent = onHitMagicPostMitigation !== null && defStats.hp > 0
    ? Math.round((onHitMagicPostMitigation / defStats.hp) * 1000) / 10
    : null;

  // Physical on-hit (nthHitPhysical / onHitPhysicalCurrentHpPercent / spellblade)
  let onHitPhysicalPreMitigation = 0;
  const baseAd = atkStats.totalAd - atkStats.bonusAd;
  for (const p of attacker.items.flatMap((i) => i.passives)) {
    if (p.kind === "nthHitPhysical") {
      onHitPhysicalPreMitigation += p.minDamage + (p.maxDamage - p.minDamage) * (attacker.level - 1) / 17;
    } else if (p.kind === "onHitPhysicalCurrentHpPercent") {
      onHitPhysicalPreMitigation += (p.percent / 100) * defStats.hp;
    } else if (p.kind === "spellblade") {
      onHitPhysicalPreMitigation += p.baseAdRatio * baseAd;
    }
  }
  const onHitPhysicalPostMitigation = onHitPhysicalPreMitigation > 0
    ? Math.round(mitigate(onHitPhysicalPreMitigation, effArmor))
    : null;
  const onHitPhysicalHpPercent = onHitPhysicalPostMitigation !== null && defStats.hp > 0
    ? Math.round((onHitPhysicalPostMitigation / defStats.hp) * 1000) / 10
    : null;

  return {
    preMitigation: Math.round(preMitigation),
    effectiveResistance: Math.round(effArmor * 10) / 10,
    postMitigation: Math.round(postMitigation),
    reductionPercent: Math.round(reductionPercent * 10) / 10,
    hpPercent: Math.round(hpPercent * 10) / 10,
    critPostMitigation: critPostMitigation !== null ? Math.round(critPostMitigation) : null,
    critHpPercent: critHpPercent !== null ? Math.round(critHpPercent * 10) / 10 : null,
    onHitMagicPostMitigation,
    onHitMagicHpPercent,
    onHitPhysicalPostMitigation,
    onHitPhysicalHpPercent,
  };
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
        hpPercent: 0,
      };
    }

    const rankIndex = rank - 1;
    const baseDmg = spec.baseDamageByRank[rankIndex] ?? 0;
    const preMitigation =
      baseDmg +
      (spec.totalAdRatioByRank[rankIndex] ?? 0) * atkStats.totalAd +
      (spec.bonusAdRatioByRank[rankIndex] ?? 0) * atkStats.bonusAd +
      (spec.apRatioByRank[rankIndex] ?? 0) * atkStats.ap;

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

    const hpPercent = defStats.hp > 0
      ? (postMitigation / defStats.hp) * 100
      : 0;

    return {
      slot: spec.slot,
      name: spec.name,
      damageType: spec.damageType,
      preMitigation: Math.round(preMitigation),
      effectiveResistance: Math.round(effectiveResistance * 10) / 10,
      postMitigation: Math.round(postMitigation),
      reductionPercent: Math.round(reductionPercent * 10) / 10,
      hpPercent: Math.round(hpPercent * 10) / 10,
    };
  });

  return { autoAttack: calculateAutoAttack(attacker, atkStats, defStats), skills };
}
