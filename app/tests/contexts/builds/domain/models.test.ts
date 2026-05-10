import { describe, it, expect } from "vitest";
import {
  validateBuildName,
  validateBuildSlot,
  normalizeSlots,
} from "@/contexts/builds/domain/models";
import { DomainError } from "@/contexts/builds/domain/errors";
import type { BuildSlot, StatPoints } from "@/contexts/builds/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

function makeStatPoints(overrides: Partial<StatPoints> = {}): StatPoints {
  return { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, ...overrides };
}

function makeSlot(overrides: Partial<BuildSlot> = {}): BuildSlot {
  return {
    slotIndex: 0,
    pokemonId: 1,
    nature: "hardy",
    statPoints: makeStatPoints(),
    abilityNameEn: "blaze",
    itemNameEn: "",
    boosts: { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    moveNameEn: "",
    ...overrides,
  };
}

// ── TASK-008: validateBuildName ──────────────────────────────────────

describe("TASK-008: validateBuildName", () => {
  it("正常系: 通常の文字列 — 例外なし", () => {
    expect(() => validateBuildName("マイ構築")).not.toThrow();
  });

  it("正常系: 50 文字の文字列 — 例外なし（上限境界）", () => {
    const name = "あ".repeat(50);
    expect(() => validateBuildName(name)).not.toThrow();
  });

  it("空文字列 \"\" — DomainError をスローする（\"構築名を入力してください\"）", () => {
    expect(() => validateBuildName("")).toThrow(DomainError);
  });

  it("スペースのみ \"   \" — trim 後に空になるため DomainError をスローする", () => {
    expect(() => validateBuildName("   ")).toThrow(DomainError);
  });

  it("51 文字の文字列 — DomainError をスローする（\"50文字以内\"）", () => {
    const name = "あ".repeat(51);
    expect(() => validateBuildName(name)).toThrow(DomainError);
  });

  it("前後にスペースがある 50 文字 — trim 後 50 文字なら例外なし", () => {
    const name = " " + "あ".repeat(50) + " ";
    expect(() => validateBuildName(name)).not.toThrow();
  });

  it("前後にスペースがある 51 文字 — trim 後 51 文字なら DomainError", () => {
    const name = " " + "あ".repeat(51) + " ";
    expect(() => validateBuildName(name)).toThrow(DomainError);
  });
});

// ── TASK-009: validateBuildSlot ──────────────────────────────────────

describe("TASK-009: validateBuildSlot", () => {
  it("pokemonId=null — バリデーションをスキップして例外なし", () => {
    const slot = makeSlot({ pokemonId: null });
    expect(() => validateBuildSlot(slot)).not.toThrow();
  });

  it("正常系: pokemonId あり, 全 SP=0 — 例外なし", () => {
    const slot = makeSlot({ pokemonId: 1, statPoints: makeStatPoints() });
    expect(() => validateBuildSlot(slot)).not.toThrow();
  });

  it("正常系: 合計=66, 各値 0〜32 — 例外なし", () => {
    const slot = makeSlot({
      pokemonId: 1,
      statPoints: makeStatPoints({ hp: 32, attack: 32, speed: 2 }),
    });
    expect(() => validateBuildSlot(slot)).not.toThrow();
  });

  it("合計=67 — DomainError をスローする（\"66以下\"）", () => {
    const slot = makeSlot({
      pokemonId: 1,
      statPoints: makeStatPoints({ hp: 32, attack: 32, speed: 3 }),
    });
    expect(() => validateBuildSlot(slot)).toThrow(DomainError);
  });

  it("任意の SP が -1 — DomainError をスローする（\"0〜32\"）", () => {
    const slot = makeSlot({
      pokemonId: 1,
      statPoints: makeStatPoints({ hp: -1 }),
    });
    expect(() => validateBuildSlot(slot)).toThrow(DomainError);
  });

  it("任意の SP が 33 — DomainError をスローする（\"0〜32\"）", () => {
    const slot = makeSlot({
      pokemonId: 1,
      statPoints: makeStatPoints({ attack: 33 }),
    });
    expect(() => validateBuildSlot(slot)).toThrow(DomainError);
  });
});

// ── TASK-010: normalizeSlots ─────────────────────────────────────────

const DEFAULT_SLOT_SP = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
const DEFAULT_SLOT_BOOSTS = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

describe("TASK-010: normalizeSlots", () => {

  it("空配列を渡す — 6 スロット分のデフォルト値が返る（slotIndex 0〜5）", () => {
    const result = normalizeSlots([]);
    expect(result).toHaveLength(6);
    expect(result.map((s) => s.slotIndex)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("slotIndex=2 のみ入力 — インデックス 2 には入力値、他はデフォルト値が入る", () => {
    const inputSlot = makeSlot({ slotIndex: 2, pokemonId: 99, nature: "timid" });
    const result = normalizeSlots([inputSlot]);
    expect(result[2].pokemonId).toBe(99);
    expect(result[2].nature).toBe("timid");
    expect(result[0].pokemonId).toBeNull();
    expect(result[1].pokemonId).toBeNull();
  });

  it("6 スロット全て入力 — 全て入力値がそのまま入る", () => {
    const slots = Array.from({ length: 6 }, (_, i) =>
      makeSlot({ slotIndex: i, pokemonId: i + 1, nature: "timid" })
    );
    const result = normalizeSlots(slots);
    expect(result).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expect(result[i].pokemonId).toBe(i + 1);
    }
  });

  it("返り値の配列長 — 常に 6 に一致する", () => {
    expect(normalizeSlots([])).toHaveLength(6);
    expect(normalizeSlots([makeSlot({ slotIndex: 0 })])).toHaveLength(6);
  });

  it("デフォルトスロット — pokemonId=null, nature=\"hardy\", SP=全0, boosts=全0", () => {
    const result = normalizeSlots([]);
    for (const slot of result) {
      expect(slot.pokemonId).toBeNull();
      expect(slot.nature).toBe("hardy");
      expect(slot.statPoints).toEqual(DEFAULT_SLOT_SP);
      expect(slot.boosts).toEqual(DEFAULT_SLOT_BOOSTS);
    }
  });

  it("slotIndex=0〜5 の順序 — 常に slotIndex 昇順で並ぶ", () => {
    // Input in reverse order
    const slots = [
      makeSlot({ slotIndex: 5, pokemonId: 5 }),
      makeSlot({ slotIndex: 3, pokemonId: 3 }),
      makeSlot({ slotIndex: 1, pokemonId: 1 }),
    ];
    const result = normalizeSlots(slots);
    expect(result.map((s) => s.slotIndex)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(result[1].pokemonId).toBe(1);
    expect(result[3].pokemonId).toBe(3);
    expect(result[5].pokemonId).toBe(5);
  });
});
