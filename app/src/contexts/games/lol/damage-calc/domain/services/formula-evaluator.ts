import { DamageFormula, StatRef } from "../types";
import { EvaluationContext } from "../models";

function resolveStat(ref: StatRef, context: EvaluationContext): number {
  switch (ref) {
    case "attacker.totalAd": return context.attacker.totalAd;
    case "attacker.bonusAd": return context.attacker.bonusAd;
    case "attacker.baseAd": return context.attacker.baseAd;
    case "attacker.ap": return context.attacker.ap;
    case "attacker.moveSpeed": return context.attacker.moveSpeed;
    case "attacker.bonusMoveSpeed": return context.attacker.bonusMoveSpeed;
    case "attacker.bonusArmor": return context.attacker.bonusArmor;
    case "attacker.bonusMagicResist": return context.attacker.bonusMagicResist;
    case "attacker.maxHp": return context.attacker.hp;
    case "attacker.stackCount": return context.stackCount ?? 0;
    case "defender.maxHp": return context.defender.hp;
    case "defender.currentHp": {
      const pct = (context.defenderHpPercent ?? 100) / 100;
      return context.defender.hp * pct;
    }
    case "defender.missingHp": {
      const pct = (context.defenderHpPercent ?? 100) / 100;
      return context.defender.hp * (1 - pct);
    }
    case "defender.armor": return context.defender.armor;
    case "defender.magicResist": return context.defender.magicResist;
  }
}

export function evaluate(formula: DamageFormula, context: EvaluationContext): number {
  switch (formula.kind) {
    case "const": return formula.value;
    case "byRank": return formula.values[context.skillRank - 1] ?? 0;
    case "byLevel": return formula.values[context.championLevel - 1] ?? 0;
    case "stat": return resolveStat(formula.ref, context);
    case "add": return formula.operands.reduce((sum, op) => sum + evaluate(op, context), 0);
    case "mul": return formula.operands.reduce((prod, op) => prod * evaluate(op, context), 1);
    case "min": return Math.min(evaluate(formula.operands[0], context), evaluate(formula.operands[1], context));
    case "max": return Math.max(evaluate(formula.operands[0], context), evaluate(formula.operands[1], context));
    case "clamp": {
      const v = evaluate(formula.value, context);
      const lo = evaluate(formula.min, context);
      const hi = evaluate(formula.max, context);
      return Math.max(lo, Math.min(hi, v));
    }
  }
}
