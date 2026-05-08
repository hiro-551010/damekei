export type DamageType = "physical" | "magic" | "true";
export type SkillSlot = "Q" | "W" | "E" | "R";

export type StatRef =
  | "attacker.totalAd"
  | "attacker.bonusAd"
  | "attacker.baseAd"
  | "attacker.ap"
  | "attacker.moveSpeed"
  | "attacker.bonusMoveSpeed"
  | "attacker.bonusArmor"
  | "attacker.bonusMagicResist"
  | "attacker.maxHp"
  | "attacker.stackCount"
  | "defender.maxHp"
  | "defender.currentHp"
  | "defender.missingHp"
  | "defender.armor"
  | "defender.magicResist";

export type DamageFormula =
  | { kind: "const"; value: number }
  | { kind: "byRank"; values: number[] }
  | { kind: "byLevel"; values: number[] }
  | { kind: "stat"; ref: StatRef }
  | { kind: "add"; operands: DamageFormula[] }
  | { kind: "mul"; operands: DamageFormula[] }
  | { kind: "min"; operands: [DamageFormula, DamageFormula] }
  | { kind: "max"; operands: [DamageFormula, DamageFormula] }
  | { kind: "clamp"; value: DamageFormula; min: DamageFormula; max: DamageFormula };
