import { describe, it, expect } from "vitest";
import {
  validateStatPoints,
  validateAbility,
  computeKnockoutChance,
} from "@/contexts/games/pokemon/damage-calc/domain/models";
import { DomainError } from "@/contexts/games/pokemon/damage-calc/domain/errors";
import type { StatPoints, Pokemon, PokemonSpecies } from "@/contexts/games/pokemon/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

function sp(overrides: Partial<StatPoints> = {}): StatPoints {
  return { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, ...overrides };
}

function makeSpecies(abilities: { name: string; nameEn: string }[]): PokemonSpecies {
  return {
    id: 6,
    name: "リザードン",
    nameEn: "charizard",
    types: ["fire", "flying"],
    baseStats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
    abilities,
    learnableMoves: [],
  };
}

function makePokemon(abilityNameEn: string, speciesAbilities?: { name: string; nameEn: string }[]): Pokemon {
  const abilities = speciesAbilities ?? [{ name: "もうか", nameEn: "blaze" }];
  return {
    species: makeSpecies(abilities),
    nature: "timid",
    statPoints: sp(),
    ability: { name: abilityNameEn, nameEn: abilityNameEn },
    item: null,
    boosts: { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
  };
}

// ── TASK-005: validateStatPoints ────────────────────────────────────

describe("TASK-005: validateStatPoints", () => {
  it("正常系: 全ステータス 0 — 例外なし", () => {
    expect(() => validateStatPoints(sp())).not.toThrow();
  });

  it("正常系: 合計 66, 各値 0〜32 — 例外なし", () => {
    // hp=32, attack=32, speed=2 → total=66
    expect(() => validateStatPoints(sp({ hp: 32, attack: 32, speed: 2 }))).not.toThrow();
  });

  it("各ステータスが 32 のとき — 例外なし（各単体では上限以内）", () => {
    expect(() => validateStatPoints(sp({ hp: 32 }))).not.toThrow();
  });

  it("合計 66（6 × 11）— 例外なし", () => {
    expect(() =>
      validateStatPoints(sp({ hp: 11, attack: 11, defense: 11, spAttack: 11, spDefense: 11, speed: 11 }))
    ).not.toThrow();
  });

  it("合計 67 — DomainError をスローする", () => {
    expect(() => validateStatPoints(sp({ hp: 32, attack: 32, speed: 3 }))).toThrow(DomainError);
  });

  it("hp = -1 — DomainError をスローする", () => {
    expect(() => validateStatPoints(sp({ hp: -1 }))).toThrow(DomainError);
  });

  it("attack = 33 — DomainError をスローする", () => {
    expect(() => validateStatPoints(sp({ attack: 33 }))).toThrow(DomainError);
  });

  it("全ステータス 32 (合計 192) — DomainError（合計超過）をスローする", () => {
    expect(() =>
      validateStatPoints(sp({ hp: 32, attack: 32, defense: 32, spAttack: 32, spDefense: 32, speed: 32 }))
    ).toThrow(DomainError);
  });

  it("境界値: hp=32, 残り=0, total=32 — 例外なし", () => {
    expect(() => validateStatPoints(sp({ hp: 32 }))).not.toThrow();
  });
});

// ── TASK-006: validateAbility ────────────────────────────────────────

describe("TASK-006: validateAbility", () => {
  it("正常系: pokemon.ability.nameEn が species.abilities に含まれる — 例外なし", () => {
    const pokemon = makePokemon("blaze", [{ name: "もうか", nameEn: "blaze" }, { name: "サンパワー", nameEn: "solar-power" }]);
    expect(() => validateAbility(pokemon)).not.toThrow();
  });

  it("異常系: pokemon.ability.nameEn が species.abilities に含まれない — DomainError をスローする", () => {
    const pokemon = makePokemon("torrent", [{ name: "もうか", nameEn: "blaze" }]);
    expect(() => validateAbility(pokemon)).toThrow(DomainError);
  });

  it("species.abilities が空配列 — DomainError をスローする", () => {
    const pokemon = makePokemon("blaze", []);
    expect(() => validateAbility(pokemon)).toThrow(DomainError);
  });

  it("ability の name（日本語）は一致しないが nameEn が一致する — 例外なし（nameEn のみ照合）", () => {
    const pokemon: Pokemon = {
      species: makeSpecies([{ name: "もうか", nameEn: "blaze" }]),
      nature: "timid",
      statPoints: sp(),
      ability: { name: "someJapaneseName", nameEn: "blaze" }, // nameEn matches
      item: null,
      boosts: { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    };
    expect(() => validateAbility(pokemon)).not.toThrow();
  });
});

// ── TASK-007: computeKnockoutChance ─────────────────────────────────

describe("TASK-007: computeKnockoutChance", () => {
  const MAX_HP = 100;

  it("全 16 ロールが defenderMaxHp 以上 — \"guaranteed\" を返す", () => {
    const rolls = Array(16).fill(100);
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("guaranteed");
  });

  it("koCount=9（9/16 ロールが HP 以上）— \"high\" を返す", () => {
    const rolls = [...Array(9).fill(100), ...Array(7).fill(99)];
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("high");
  });

  it("koCount=8（8/16 ロールが HP 以上）— \"low\" を返す", () => {
    const rolls = [...Array(8).fill(100), ...Array(8).fill(99)];
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("low");
  });

  it("koCount=1（1/16 ロールが HP 以上）— \"low\" を返す", () => {
    const rolls = [100, ...Array(15).fill(99)];
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("low");
  });

  it("koCount=0（全ロールが HP 未満）— \"guaranteed_no\" を返す", () => {
    const rolls = Array(16).fill(99);
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("guaranteed_no");
  });

  it("境界値: koCount=16 — \"guaranteed\"", () => {
    const rolls = Array(16).fill(100);
    expect(computeKnockoutChance(rolls, 100)).toBe("guaranteed");
  });

  it("境界値: koCount=9 — \"high\"", () => {
    const rolls = [...Array(9).fill(100), ...Array(7).fill(99)];
    expect(computeKnockoutChance(rolls, 100)).toBe("high");
  });

  it("境界値: koCount=8 — \"low\"", () => {
    const rolls = [...Array(8).fill(100), ...Array(8).fill(99)];
    expect(computeKnockoutChance(rolls, 100)).toBe("low");
  });

  it("境界値: koCount=1 — \"low\"", () => {
    const rolls = [100, ...Array(15).fill(50)];
    expect(computeKnockoutChance(rolls, 100)).toBe("low");
  });

  it("境界値: koCount=0 — \"guaranteed_no\"", () => {
    const rolls = Array(16).fill(50);
    expect(computeKnockoutChance(rolls, 100)).toBe("guaranteed_no");
  });

  it("ロール配列が 16 未満の要素数でも正しく動作する", () => {
    // 8 rolls, all >= MAX_HP → koCount=8 → "low"
    const rolls = Array(8).fill(100);
    expect(computeKnockoutChance(rolls, MAX_HP)).toBe("low");
  });
});
