import { describe, it, expect } from "vitest";
import { evaluate } from "@/contexts/games/lol/damage-calc/domain/services/formula-evaluator";
import type { EvaluationContext } from "@/contexts/games/lol/damage-calc/domain/models";
import type { DamageFormula } from "@/contexts/games/lol/damage-calc/domain/types";

function makeContext(overrides: Partial<EvaluationContext> = {}): EvaluationContext {
  const baseAttacker = {
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
    moveSpeed: 325,
    bonusMoveSpeed: 0,
  };
  const baseDefender = {
    totalAd: 80,
    bonusAd: 0,
    baseAd: 80,
    ap: 0,
    armor: 60,
    magicResist: 50,
    hp: 2000,
    lethality: 0,
    armorPenPercent: 0,
    magicPenFlat: 0,
    magicPenPercent: 0,
    critChance: 0,
    bonusArmor: 0,
    bonusMagicResist: 0,
    moveSpeed: 325,
    bonusMoveSpeed: 0,
  };
  return {
    attacker: baseAttacker,
    defender: baseDefender,
    skillRank: 3,
    championLevel: 10,
    stackCount: undefined,
    defenderHpPercent: undefined,
    ...overrides,
  };
}

describe("TASK-001: FormulaEvaluator — evaluate 関数", () => {
  // ── const ──────────────────────────────────────────────────────────
  describe("const", () => {
    it("固定値をそのまま返す", () => {
      const formula: DamageFormula = { kind: "const", value: 42 };
      expect(evaluate(formula, makeContext())).toBe(42);
    });
  });

  // ── byRank ────────────────────────────────────────────────────────
  describe("byRank", () => {
    it("skillRank=1 のとき values[0] を返す", () => {
      const formula: DamageFormula = { kind: "byRank", values: [100, 150, 200, 250, 300] };
      expect(evaluate(formula, makeContext({ skillRank: 1 }))).toBe(100);
    });

    it("skillRank=3 のとき values[2] を返す", () => {
      const formula: DamageFormula = { kind: "byRank", values: [100, 150, 200, 250, 300] };
      expect(evaluate(formula, makeContext({ skillRank: 3 }))).toBe(200);
    });

    it("skillRank が values の長さを超えたとき 0 を返す（境界値）", () => {
      const formula: DamageFormula = { kind: "byRank", values: [100] };
      expect(evaluate(formula, makeContext({ skillRank: 3 }))).toBe(0);
    });
  });

  // ── byLevel ───────────────────────────────────────────────────────
  describe("byLevel", () => {
    it("championLevel=1 のとき values[0] を返す", () => {
      const formula: DamageFormula = { kind: "byLevel", values: [0.04, 0.05, 0.06] };
      expect(evaluate(formula, makeContext({ championLevel: 1 }))).toBeCloseTo(0.04);
    });

    it("championLevel=18 のとき values[17] を返す", () => {
      const values = Array.from({ length: 18 }, (_, i) => (i + 1) * 10);
      const formula: DamageFormula = { kind: "byLevel", values };
      expect(evaluate(formula, makeContext({ championLevel: 18 }))).toBe(180);
    });

    it("championLevel が values の長さを超えたとき 0 を返す（境界値）", () => {
      const formula: DamageFormula = { kind: "byLevel", values: [10, 20] };
      expect(evaluate(formula, makeContext({ championLevel: 5 }))).toBe(0);
    });
  });

  // ── stat ──────────────────────────────────────────────────────────
  describe("stat", () => {
    it("stat: attacker.totalAd — context.attacker.totalAd をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.totalAd" };
      expect(evaluate(formula, makeContext())).toBe(100);
    });

    it("stat: attacker.bonusAd — context.attacker.bonusAd をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusAd" };
      expect(evaluate(formula, makeContext())).toBe(40);
    });

    it("stat: attacker.baseAd — context.attacker.baseAd をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.baseAd" };
      expect(evaluate(formula, makeContext())).toBe(60);
    });

    it("stat: attacker.ap — context.attacker.ap をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.ap" };
      expect(evaluate(formula, makeContext())).toBe(200);
    });

    it("stat: attacker.moveSpeed — context.attacker.moveSpeed をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.moveSpeed" };
      expect(evaluate(formula, makeContext())).toBe(325);
    });

    it("stat: attacker.bonusMoveSpeed — context.attacker.bonusMoveSpeed をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusMoveSpeed" };
      expect(evaluate(formula, makeContext())).toBe(0);
    });

    it("stat: attacker.bonusArmor — context.attacker.bonusArmor をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusArmor" };
      expect(evaluate(formula, makeContext())).toBe(10);
    });

    it("stat: attacker.bonusMagicResist — context.attacker.bonusMagicResist をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.bonusMagicResist" };
      expect(evaluate(formula, makeContext())).toBe(8);
    });

    it("stat: attacker.maxHp — context.attacker.hp をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.maxHp" };
      expect(evaluate(formula, makeContext())).toBe(1000);
    });

    it("stat: attacker.stackCount — context.stackCount が定義済みの場合その値を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.stackCount" };
      expect(evaluate(formula, makeContext({ stackCount: 50 }))).toBe(50);
    });

    it("stat: attacker.stackCount — context.stackCount が undefined のとき 0 を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "attacker.stackCount" };
      expect(evaluate(formula, makeContext({ stackCount: undefined }))).toBe(0);
    });

    it("stat: defender.maxHp — context.defender.hp をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.maxHp" };
      expect(evaluate(formula, makeContext())).toBe(2000);
    });

    it("stat: defender.currentHp — defenderHpPercent=100 のとき defender.hp * 1.0 を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.currentHp" };
      expect(evaluate(formula, makeContext({ defenderHpPercent: 100 }))).toBe(2000);
    });

    it("stat: defender.currentHp — defenderHpPercent=50 のとき defender.hp * 0.5 を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.currentHp" };
      expect(evaluate(formula, makeContext({ defenderHpPercent: 50 }))).toBe(1000);
    });

    it("stat: defender.currentHp — defenderHpPercent が undefined のとき defender.hp * 1.0 を返す（デフォルト 100%）", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.currentHp" };
      expect(evaluate(formula, makeContext({ defenderHpPercent: undefined }))).toBe(2000);
    });

    it("stat: defender.missingHp — defenderHpPercent=100 のとき 0 を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.missingHp" };
      expect(evaluate(formula, makeContext({ defenderHpPercent: 100 }))).toBe(0);
    });

    it("stat: defender.missingHp — defenderHpPercent=50 のとき defender.hp * 0.5 を返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.missingHp" };
      expect(evaluate(formula, makeContext({ defenderHpPercent: 50 }))).toBe(1000);
    });

    it("stat: defender.armor — context.defender.armor をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.armor" };
      expect(evaluate(formula, makeContext())).toBe(60);
    });

    it("stat: defender.magicResist — context.defender.magicResist をそのまま返す", () => {
      const formula: DamageFormula = { kind: "stat", ref: "defender.magicResist" };
      expect(evaluate(formula, makeContext())).toBe(50);
    });
  });

  // ── add ───────────────────────────────────────────────────────────
  describe("add", () => {
    it("複数の operands の合計を返す", () => {
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

    it("operands が空配列のとき 0 を返す", () => {
      const formula: DamageFormula = { kind: "add", operands: [] };
      expect(evaluate(formula, makeContext())).toBe(0);
    });

    it("ネストした formula を再帰評価する", () => {
      const formula: DamageFormula = {
        kind: "add",
        operands: [
          { kind: "const", value: 10 },
          { kind: "add", operands: [{ kind: "const", value: 20 }, { kind: "const", value: 30 }] },
        ],
      };
      expect(evaluate(formula, makeContext())).toBe(60);
    });
  });

  // ── mul ───────────────────────────────────────────────────────────
  describe("mul", () => {
    it("複数の operands の積を返す", () => {
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

    it("operands が空配列のとき 1 を返す（reduce 初期値）", () => {
      const formula: DamageFormula = { kind: "mul", operands: [] };
      expect(evaluate(formula, makeContext())).toBe(1);
    });

    it("operands に 0 が含まれるとき 0 を返す", () => {
      const formula: DamageFormula = {
        kind: "mul",
        operands: [{ kind: "const", value: 100 }, { kind: "const", value: 0 }],
      };
      expect(evaluate(formula, makeContext())).toBe(0);
    });
  });

  // ── min ───────────────────────────────────────────────────────────
  describe("min", () => {
    it("小さい方の値を返す", () => {
      const formula: DamageFormula = {
        kind: "min",
        operands: [{ kind: "const", value: 30 }, { kind: "const", value: 50 }],
      };
      expect(evaluate(formula, makeContext())).toBe(30);
    });

    it("両辺が同値のとき同値を返す", () => {
      const formula: DamageFormula = {
        kind: "min",
        operands: [{ kind: "const", value: 40 }, { kind: "const", value: 40 }],
      };
      expect(evaluate(formula, makeContext())).toBe(40);
    });
  });

  // ── max ───────────────────────────────────────────────────────────
  describe("max", () => {
    it("大きい方の値を返す", () => {
      const formula: DamageFormula = {
        kind: "max",
        operands: [{ kind: "const", value: 30 }, { kind: "const", value: 50 }],
      };
      expect(evaluate(formula, makeContext())).toBe(50);
    });

    it("両辺が同値のとき同値を返す", () => {
      const formula: DamageFormula = {
        kind: "max",
        operands: [{ kind: "const", value: 40 }, { kind: "const", value: 40 }],
      };
      expect(evaluate(formula, makeContext())).toBe(40);
    });
  });

  // ── clamp ─────────────────────────────────────────────────────────
  describe("clamp", () => {
    it("value が min〜max の範囲内のときそのまま返す", () => {
      const formula: DamageFormula = {
        kind: "clamp",
        value: { kind: "const", value: 50 },
        min: { kind: "const", value: 10 },
        max: { kind: "const", value: 100 },
      };
      expect(evaluate(formula, makeContext())).toBe(50);
    });

    it("value が min を下回るとき min を返す", () => {
      const formula: DamageFormula = {
        kind: "clamp",
        value: { kind: "const", value: 5 },
        min: { kind: "const", value: 10 },
        max: { kind: "const", value: 100 },
      };
      expect(evaluate(formula, makeContext())).toBe(10);
    });

    it("value が max を上回るとき max を返す", () => {
      const formula: DamageFormula = {
        kind: "clamp",
        value: { kind: "const", value: 200 },
        min: { kind: "const", value: 10 },
        max: { kind: "const", value: 100 },
      };
      expect(evaluate(formula, makeContext())).toBe(100);
    });

    it("min と max が同値のとき常に min/max を返す（境界値）", () => {
      const formula: DamageFormula = {
        kind: "clamp",
        value: { kind: "const", value: 999 },
        min: { kind: "const", value: 42 },
        max: { kind: "const", value: 42 },
      };
      expect(evaluate(formula, makeContext())).toBe(42);
    });
  });

  // ── 複合式 ────────────────────────────────────────────────────────
  describe("複合式", () => {
    it("add([mul([stat, const]), const]) の多段ネストが正しく計算される", () => {
      // mul([attacker.totalAd(=100), const(2)]) = 200
      // add([200, const(50)]) = 250
      const formula: DamageFormula = {
        kind: "add",
        operands: [
          {
            kind: "mul",
            operands: [
              { kind: "stat", ref: "attacker.totalAd" },
              { kind: "const", value: 2 },
            ],
          },
          { kind: "const", value: 50 },
        ],
      };
      expect(evaluate(formula, makeContext())).toBe(250);
    });
  });
});
