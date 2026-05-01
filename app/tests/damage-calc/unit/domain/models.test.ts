import { describe, it, expect } from "vitest";
import {
  validateStatPoints,
  validateAbility,
  computeKnockoutChance,
} from "@/contexts/games/pokemon/damage-calc/domain/models";
import { DomainError } from "@/contexts/games/pokemon/damage-calc/domain/errors";
import type { StatPoints, Pokemon } from "@/contexts/games/pokemon/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

function sp(overrides: Partial<StatPoints> = {}): StatPoints {
  return { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, ...overrides };
}

function makePokemon(abilityNameEn: string, validAbilities: string[] = ["blaze"]): Pokemon {
  return {
    species: {
      id: 6,
      name: "リザードン",
      nameEn: "charizard",
      types: ["fire", "flying"],
      baseStats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
      abilities: validAbilities.map((a) => ({ name: a, nameEn: a })),
      learnableMoves: [],
    },
    nature: "timid",
    statPoints: sp(),
    ability: { name: abilityNameEn, nameEn: abilityNameEn },
    item: null,
    boosts: { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
  };
}

// ── validateStatPoints ───────────────────────────────────────────────

describe("validateStatPoints", () => {
  it("全 0 は valid", () => {
    expect(() => validateStatPoints(sp())).not.toThrow();
  });

  it("全ステータスが上限 32 で合計 192 → DomainError", () => {
    expect(() =>
      validateStatPoints(sp({ hp: 32, attack: 32, defense: 32, spAttack: 32, spDefense: 32, speed: 32 }))
    ).toThrow(DomainError);
  });

  it("合計が上限ちょうど 66 は valid", () => {
    expect(() =>
      validateStatPoints(sp({ hp: 32, attack: 32, speed: 2 }))
    ).not.toThrow();
  });

  it("合計が 67 → DomainError", () => {
    expect(() =>
      validateStatPoints(sp({ hp: 32, attack: 32, speed: 3 }))
    ).toThrow(DomainError);
  });

  it("ステータスが 33 → DomainError", () => {
    expect(() => validateStatPoints(sp({ hp: 33 }))).toThrow(DomainError);
  });

  it("ステータスが -1 → DomainError", () => {
    expect(() => validateStatPoints(sp({ attack: -1 }))).toThrow(DomainError);
  });

  it("ステータスが 32 単体は valid", () => {
    expect(() => validateStatPoints(sp({ hp: 32 }))).not.toThrow();
  });
});

// ── validateAbility ──────────────────────────────────────────────────

describe("validateAbility", () => {
  it("species が持つ特性なら valid", () => {
    expect(() => validateAbility(makePokemon("blaze", ["blaze", "solar-power"]))).not.toThrow();
  });

  it("species が持たない特性なら DomainError", () => {
    expect(() => validateAbility(makePokemon("torrent", ["blaze", "solar-power"]))).toThrow(DomainError);
  });

  it("特性リストが 1 つでも一致すれば valid", () => {
    expect(() => validateAbility(makePokemon("solar-power", ["blaze", "solar-power"]))).not.toThrow();
  });
});

// ── computeKnockoutChance ────────────────────────────────────────────

describe("computeKnockoutChance", () => {
  const MAX_HP = 100;

  it("全 16 通りが maxHp 以上 → guaranteed", () => {
    const rolls = Array(16).fill(100);
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("guaranteed");
  });

  it("15 通りが KO → high", () => {
    const rolls = [...Array(15).fill(100), 99];
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("high");
  });

  it("9 通りが KO → high（境界値）", () => {
    const rolls = [...Array(9).fill(100), ...Array(7).fill(99)];
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("high");
  });

  it("8 通りが KO → low（境界値）", () => {
    const rolls = [...Array(8).fill(100), ...Array(8).fill(99)];
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("low");
  });

  it("1 通りが KO → low（境界値）", () => {
    const rolls = [100, ...Array(15).fill(99)];
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("low");
  });

  it("全 16 通りが KO 未満 → guaranteed_no", () => {
    const rolls = Array(16).fill(99);
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("guaranteed_no");
  });

  it("ダメージが maxHp ちょうどは KO と判定", () => {
    const rolls = Array(16).fill(100);
    expect(computeKnockoutChance(rolls, 100)).toBe("guaranteed");
  });
});
