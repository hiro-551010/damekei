import {
  AutoAttackResult, Champion, ChampionPassiveAAResult, ChampionStateResult,
  ComputedStats, DamageResult, EvaluationContext, SkillDamageResult, SkillVariantResult,
} from "../models";
import { computeStats } from "./stats-computer";
import { evaluate } from "./formula-evaluator";
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

function buildContext(atkStats: ComputedStats, defStats: ComputedStats, rank: number, level: number, stackCount?: number, defenderHpPercent?: number): EvaluationContext {
  return { attacker: atkStats, defender: defStats, skillRank: rank, championLevel: level, stackCount, defenderHpPercent };
}

function calculateAutoAttack(attacker: Champion, atkStats: ComputedStats, defStats: ComputedStats): AutoAttackResult {
  const effArmor = effectiveArmor(defStats.armor, atkStats);
  const preMitigation = atkStats.totalAd;
  const postMitigation = mitigate(preMitigation, effArmor);
  const reductionPercent = preMitigation > 0
    ? ((preMitigation - postMitigation) / preMitigation) * 100
    : 0;
  const hpPercent = defStats.hp > 0 ? (postMitigation / defStats.hp) * 100 : 0;

  const aaCritOverride = attacker.species.aaCritOverride;
  const hasCrit = (aaCritOverride?.alwaysCrit ?? false) || atkStats.critChance > 0;
  const bonusCritFactor = attacker.items
    .flatMap((i) => i.passives)
    .reduce((sum, p) => {
      if (p.kind !== "critDamageAmp") return sum;
      if (atkStats.critChance < p.minCritChance) return sum;
      return sum + p.bonusFactor;
    }, 0);
  const critMultiplier = (aaCritOverride?.baseMultiplier ?? 1.75) + bonusCritFactor;
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

  let onHitPhysicalPreMitigation = 0;
  for (const p of attacker.items.flatMap((i) => i.passives)) {
    if (p.kind === "nthHitPhysical") {
      onHitPhysicalPreMitigation += p.minDamage + (p.maxDamage - p.minDamage) * (attacker.level - 1) / 17;
    } else if (p.kind === "onHitPhysicalCurrentHpPercent") {
      onHitPhysicalPreMitigation += (p.percent / 100) * defStats.hp;
    } else if (p.kind === "spellblade") {
      onHitPhysicalPreMitigation += p.baseAdRatio * atkStats.baseAd;
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

function calculateSkills(
  attacker: Champion,
  atkStats: ComputedStats,
  defStats: ComputedStats,
  options?: CalculateOptions,
): SkillDamageResult[] {
  return attacker.species.skills.flatMap((spec) => {
    const rank = skillRank(spec.slot, attacker.skillAllocation);

    if (rank === 0) {
      return [{
        slot: spec.slot,
        name: spec.name,
        damageType: spec.damageType,
        preMitigation: 0,
        effectiveResistance: 0,
        postMitigation: 0,
        reductionPercent: 0,
        hpPercent: 0,
      }];
    }

    const context = buildContext(atkStats, defStats, rank, attacker.level, options?.stackCount, options?.defenderHpPercent);
    const preMitigation = evaluate(spec.damageFormula, context);

    if (preMitigation === 0) {
      return [];
    }

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

    const variants: SkillVariantResult[] = (spec.variants ?? []).map((v) => {
      const vDamageType = v.damageType ?? spec.damageType;
      const vPreMit = v.formula
        ? evaluate(v.formula, context)
        : preMitigation * (v.multiplier ?? 1);
      let vEffRes: number;
      if (vDamageType === "physical") {
        vEffRes = effectiveArmor(defStats.armor, atkStats);
      } else if (vDamageType === "magic") {
        vEffRes = effectiveMagicResist(defStats.magicResist, atkStats);
      } else {
        vEffRes = 0;
      }
      const vPostMit = vDamageType === "true" ? vPreMit : mitigate(vPreMit, vEffRes);
      const vReduction = vPreMit > 0 ? ((vPreMit - vPostMit) / vPreMit) * 100 : 0;
      const vHp = defStats.hp > 0 ? (vPostMit / defStats.hp) * 100 : 0;
      return {
        name: v.name,
        preMitigation: Math.round(vPreMit),
        effectiveResistance: Math.round(vEffRes * 10) / 10,
        postMitigation: Math.round(vPostMit),
        reductionPercent: Math.round(vReduction * 10) / 10,
        hpPercent: Math.round(vHp * 10) / 10,
      };
    });

    return [{
      slot: spec.slot,
      name: spec.name,
      damageType: spec.damageType,
      preMitigation: Math.round(preMitigation),
      effectiveResistance: Math.round(effectiveResistance * 10) / 10,
      postMitigation: Math.round(postMitigation),
      reductionPercent: Math.round(reductionPercent * 10) / 10,
      hpPercent: Math.round(hpPercent * 10) / 10,
      ...(variants.length > 0 && { variants }),
    }];
  });
}

function calculateChampionPassiveAA(
  attacker: Champion,
  atkStats: ComputedStats,
  defStats: ComputedStats,
  options?: CalculateOptions,
): ChampionPassiveAAResult | undefined {
  const spec = attacker.species.passiveSpec;
  if (!spec) return undefined;

  if (spec.kind === "onHitDamage") {
    const context = buildContext(atkStats, defStats, 1, attacker.level, undefined, options?.defenderHpPercent);
    const preMit = evaluate(spec.formula, context);

    let effRes: number;
    if (spec.damageType === "physical") {
      effRes = effectiveArmor(defStats.armor, atkStats);
    } else if (spec.damageType === "magic") {
      effRes = effectiveMagicResist(defStats.magicResist, atkStats);
    } else {
      effRes = 0;
    }

    const postMit = spec.damageType === "true" ? preMit : mitigate(preMit, effRes);
    const reductionPct = preMit > 0 ? ((preMit - postMit) / preMit) * 100 : 0;
    const hpPct = defStats.hp > 0 ? (postMit / defStats.hp) * 100 : 0;

    return {
      damageType: spec.damageType,
      preMitigation: Math.round(preMit),
      effectiveResistance: Math.round(effRes * 10) / 10,
      postMitigation: Math.round(postMit),
      reductionPercent: Math.round(reductionPct * 10) / 10,
      hpPercent: Math.round(hpPct * 10) / 10,
    };
  }
}

function applyStateModifier(stats: ComputedStats, modifier: NonNullable<Champion["species"]["stateModifiers"]>[0], rank: number, level: number): ComputedStats {
  let result = { ...stats };
  const mockContext = buildContext(stats, stats, rank, level);
  for (const sm of modifier.statModifiers) {
    const delta = evaluate(sm.addFormula, mockContext);
    switch (sm.stat) {
      case "attacker.bonusAd":
        result = { ...result, bonusAd: result.bonusAd + delta, totalAd: result.totalAd + delta };
        break;
    }
  }
  return result;
}

type CalculateOptions = {
  stackCount?: number;
  defenderHpPercent?: number;
};

export function calculateDamage(attacker: Champion, defender: Champion, options?: CalculateOptions): DamageResult {
  const atkStats = computeStats(attacker);
  const defStats = computeStats(defender);

  const autoAttack = calculateAutoAttack(attacker, atkStats, defStats);
  const skills = calculateSkills(attacker, atkStats, defStats, options);
  const championPassiveAA = calculateChampionPassiveAA(attacker, atkStats, defStats, options);

  const stateResults: ChampionStateResult[] = [];
  for (const modifier of attacker.species.stateModifiers ?? []) {
    const slotKey = modifier.triggerSlot.toLowerCase() as "q" | "w" | "e" | "r";
    const rank = attacker.skillAllocation[slotKey];
    if (rank === 0) continue;

    const modifiedAtkStats = applyStateModifier(atkStats, modifier, rank, attacker.level);
    stateResults.push({
      stateName: modifier.name,
      rank,
      autoAttack: calculateAutoAttack(attacker, modifiedAtkStats, defStats),
      skills: calculateSkills(attacker, modifiedAtkStats, defStats, options),
      ...(championPassiveAA && { championPassiveAA }),
    });
  }

  return {
    autoAttack,
    skills,
    ...(championPassiveAA && { championPassiveAA }),
    ...(stateResults.length > 0 && { stateResults }),
  };
}
