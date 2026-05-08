import { describe, it, expect } from "vitest";
import { evaluate } from "@/contexts/games/lol/damage-calc/domain/services/formula-evaluator";
import type { EvaluationContext } from "@/contexts/games/lol/damage-calc/domain/models";
import type { DamageFormula } from "@/contexts/games/lol/damage-calc/domain/types";

function makeContext(overrides: Partial<EvaluationContext> = {}): EvaluationContext {
  const baseStats = {
    totalAd: 100,
    bonusAd: 40,
    baseAd: 60,
    ap: 200,
    armor: 50,
    magicResist: 40,
    hp: 1000,
    lethality: 0,
    armorPenPercent: 0,
    magicPenFlat: 0,
    magicPenPercent: 0,
    critChance: 0,
    bonusArmor: 10,
    bonusMagicResist: 8,
    moveSpeed: 0,
    bonusMoveSpeed: 0,
  };
  return {
    attacker: baseStats,
    defender: { ...baseStats, hp: 2000, armor: 60, magicResist: 50 },
    skillRank: 3,
    championLevel: 10,
    stackCount: undefined,
    ...overrides,
  };
}

describe("formula-evaluator", () => {
  describe("const", () => {
    it("固定値をそのまま返す", () => {
      const formula: DamageFormula = { kind: "const", value: 42 };
      expect(evaluate(formula, makeContext())).toBe(42);
    });

    it("0を返す", () => {
      const formula: DamageFormula = { kind: "const", value: 0 };
      expect(evaluate(formula, makeContext())).toBe(0);
    });
  });

  describe("byRank", () => {
    it("rank=1 のとき values[0] を返す", () => {
      const formula: DamageFormula = { kind: "byRank", values: [100, 150, 200, 250, 300] };
      expect(evaluate(formula, makeContext({ skillRank: 1 }))).toBe(100);
    });

    it("rank=3 のとき values[2] を返す", () => {
      const formula: DamageFormula = { kind: "byRank", values: [100, 150, 200, 250, 300] };
      expect(evaluate(formula, makeContext({ skillRank: 3 }))).toBe(200);
    });

    it("rank=5 のとき values[4] を返す", () => {
      const formula: DamageFormula = { kind: "byRank", values: [100, 150, 200, 250, 300] };
      expect(evaluate(formula, makeContext({ skillRank: 5 }))).toBe(300);
    });

    it("範囲外のインデックスは 0 を返す", () => {
      const formula: DamageFormula = { kind: "byRank", values: [100] };
      expect(evaluate(formula, makeContext({ skillRank: 3 }))).toBe(0);
    });
  });

  describe("byLevel", () => {
    it("level=1 のとき values[0] を返す", () => {
      const formula: DamageFormula = { kind: "byLevel", values: [0.04, 0.05, 0.06] };
      expect(evaluate(formula, makeContext({ championLevel: 1 }))).toBeCloseTo(0.04);
    });

    it("level=10 のとき values[9] を返す", () => {
      const values = Array.from({ length: 18 }, (_, i) => (i + 1) * 0.01);
      const formula: DamageFormula = { kind: "byLevel", values };
      expect(evaluate(formula, makeContext({ championLevel: 10 }))).toBeCloseTo(0.10);
    });
  });

  describe("stat", () => {
    it("attacker.totalAd を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.totalAd" };
      expect(evaluate(formula, makeContext())).toBe(100);
    });

    it("attacker.bonusAd を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusAd" };
      expect(evaluate(formula, makeContext())).toBe(40);
    });

    it("attacker.baseAd が totalAd - bonusAd になる", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.baseAd" };
      const ctx = makeContext();
      // baseAd = 60, totalAd = 100, bonusAd = 40
      expect(evaluate(formula, ctx)).toBe(60);
      expect(evaluate(formula, ctx)).toBe(ctx.attacker.totalAd - ctx.attacker.bonusAd);
    });

    it("attacker.ap を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.ap" };
      expect(evaluate(formula, makeContext())).toBe(200);
    });

    it("attacker.bonusArmor を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusArmor" };
      expect(evaluate(formula, makeContext())).toBe(10);
    });

    it("attacker.bonusMagicResist を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusMagicResist" };
      expect(evaluate(formula, makeContext())).toBe(8);
    });

    it("attacker.moveSpeed を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.moveSpeed" };
      expect(evaluate(formula, makeContext())).toBe(0);
    });

    it("attacker.bonusMoveSpeed を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusMoveSpeed" };
      expect(evaluate(formula, makeContext())).toBe(0);
    });

    it("attacker.maxHp を返す（攻撃側HP）", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.maxHp" };
      expect(evaluate(formula, makeContext())).toBe(1000);
    });

    it("attacker.stackCount が未定義のとき 0 を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.stackCount" };
      expect(evaluate(formula, makeContext({ stackCount: undefined }))).toBe(0);
    });

    it("attacker.stackCount が指定されているとき その値を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.stackCount" };
      expect(evaluate(formula, makeContext({ stackCount: 50 }))).toBe(50);
    });

    it("defender.maxHp を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.maxHp" };
      expect(evaluate(formula, makeContext())).toBe(2000);
    });

    it("defender.currentHp は満HP前提で maxHp と同値", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.currentHp" };
      const ctx = makeContext();
      expect(evaluate(formula, ctx)).toBe(ctx.defender.hp);
    });

    it("defender.missingHp は満HP前提で 0", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.missingHp" };
      expect(evaluate(formula, makeContext())).toBe(0);
    });

    it("defender.armor を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.armor" };
      expect(evaluate(formula, makeContext())).toBe(60);
    });

    it("defender.magicResist を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.magicResist" };
      expect(evaluate(formula, makeContext())).toBe(50);
    });
  });

  describe("add", () => {
    it("全 operands の合計を返す", () => {
      const formula: DamageFormula = {
        kind: "add",
        operands: [
          { kind: "const", value: 100 },
          { kind: "const", value: 50 },
          { kind: "const", value: 25 },
        ],
      };
      expect(evaluate(formula, makeContext())).toBe(175);
    });

    it("operands が空のとき 0 を返す", () => {
      const formula: DamageFormula = { kind: "add", operands: [] };
      expect(evaluate(formula, makeContext())).toBe(0);
    });
  });

  describe("mul", () => {
    it("全 operands の積を返す", () => {
      const formula: DamageFormula = {
        kind: "mul",
        operands: [
          { kind: "const", value: 2 },
          { kind: "const", value: 3 },
          { kind: "const", value: 4 },
        ],
      };
      expect(evaluate(formula, makeContext())).toBe(24);
    });

    it("operands が空のとき 1 を返す", () => {
      const formula: DamageFormula = { kind: "mul", operands: [] };
      expect(evaluate(formula, makeContext())).toBe(1);
    });
  });

  describe("min", () => {
    it("小さい方を返す", () => {
      const formula: DamageFormula = {
        kind: "min",
        operands: [{ kind: "const", value: 30 }, { kind: "const", value: 50 }],
      };
      expect(evaluate(formula, makeContext())).toBe(30);
    });
  });

  describe("max", () => {
    it("大きい方を返す", () => {
      const formula: DamageFormula = {
        kind: "max",
        operands: [{ kind: "const", value: 30 }, { kind: "const", value: 50 }],
      };
      expect(evaluate(formula, makeContext())).toBe(50);
    });
  });

  describe("clamp", () => {
    it("値が範囲内なら そのまま返す", () => {
      const formula: DamageFormula = {
        kind: "clamp",
        value: { kind: "const", value: 50 },
        min: { kind: "const", value: 10 },
        max: { kind: "const", value: 100 },
      };
      expect(evaluate(formula, makeContext())).toBe(50);
    });

    it("値が min 未満なら min を返す", () => {
      const formula: DamageFormula = {
        kind: "clamp",
        value: { kind: "const", value: 5 },
        min: { kind: "const", value: 10 },
        max: { kind: "const", value: 100 },
      };
      expect(evaluate(formula, makeContext())).toBe(10);
    });

    it("値が max を超えたら max を返す", () => {
      const formula: DamageFormula = {
        kind: "clamp",
        value: { kind: "const", value: 200 },
        min: { kind: "const", value: 10 },
        max: { kind: "const", value: 100 },
      };
      expect(evaluate(formula, makeContext())).toBe(100);
    });
  });

  describe("Aatrox パッシブ検証", () => {
    it("defender.maxHp × byLevel[level-1] で Lv1 の 4% ダメージになる", () => {
      const formula: DamageFormula = {
        kind: "mul",
        operands: [
          { kind: "stat", ref: "defender.maxHp" },
          { kind: "byLevel", values: [0.04, 0.0439, 0.0479] },
        ],
      };
      const ctx = makeContext({ championLevel: 1 });
      // defender.hp = 2000, 2000 * 0.04 = 80
      expect(evaluate(formula, ctx)).toBeCloseTo(80);
    });

    it("attacker.baseAd は totalAd - bonusAd: Aatrox R ステートモディファイア検証", () => {
      const formula: DamageFormula = {
        kind: "mul",
        operands: [
          { kind: "stat", ref: "attacker.baseAd" },
          { kind: "byRank", values: [0.20, 0.30, 0.40] },
        ],
      };
      const ctx = makeContext({ skillRank: 1 });
      // baseAd = 60, rank1 → 60 * 0.20 = 12
      expect(evaluate(formula, ctx)).toBeCloseTo(12);
    });
  });
});
