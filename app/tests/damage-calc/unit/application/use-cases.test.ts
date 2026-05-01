import { describe, it, expect, vi } from "vitest";
import { getPokemonList, getPokemonDetail, calculateDamage } from "@/contexts/games/pokemon/damage-calc/application/use-cases";
import { NotFoundError } from "@/contexts/games/pokemon/damage-calc/domain/errors";
import { DomainError } from "@/contexts/games/pokemon/damage-calc/domain/errors";
import type { PokemonRepository, DamageCalculator } from "@/contexts/games/pokemon/damage-calc/domain/ports";
import type { PokemonSpecies, DamageResult } from "@/contexts/games/pokemon/damage-calc/domain/models";

// ── フィクスチャ ──────────────────────────────────────────────────

const CHARIZARD: PokemonSpecies = {
  id: 6,
  name: "リザードン",
  nameEn: "charizard",
  types: ["fire", "flying"],
  baseStats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
  abilities: [
    { name: "もうか", nameEn: "blaze" },
    { name: "サンパワー", nameEn: "solar-power" },
  ],
  learnableMoves: [
    { id: 53, name: "かえんほうしゃ", nameEn: "flamethrower", power: 90, type: "fire", category: "special" },
    { id: 337, name: "だいもんじ", nameEn: "fire-blast", power: 110, type: "fire", category: "special" },
  ],
};

const VENUSAUR: PokemonSpecies = {
  id: 3,
  name: "フシギバナ",
  nameEn: "venusaur",
  types: ["grass", "poison"],
  baseStats: { hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 },
  abilities: [
    { name: "しんりょく", nameEn: "overgrow" },
    { name: "ようりょくそ", nameEn: "chlorophyll" },
  ],
  learnableMoves: [
    { id: 75, name: "ソーラービーム", nameEn: "solar-beam", power: 120, type: "grass", category: "special" },
  ],
};

function makeRepo(species: PokemonSpecies[]): PokemonRepository {
  return {
    getAll: () => species,
    getById: (id) => species.find((s) => s.id === id),
  };
}

const DUMMY_RESULT: DamageResult = {
  rolls: Array(16).fill(50),
  hitCount: 1,
  min: 50,
  max: 50,
  percentages: Array(16).fill(50),
  minPercent: 50,
  maxPercent: 50,
  knockoutChance: "guaranteed_no",
};

function makeCalc(result: DamageResult = DUMMY_RESULT): DamageCalculator {
  return { calculate: vi.fn().mockReturnValue(result) };
}

const DEFAULT_SP = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
const DEFAULT_BOOSTS = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

// ── getPokemonList ────────────────────────────────────────────────

describe("getPokemonList", () => {
  it("全ポケモンを DTO に変換して返す", () => {
    const repo = makeRepo([CHARIZARD, VENUSAUR]);
    const list = getPokemonList(repo);
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: 6, name: "リザードン", nameEn: "charizard" });
    expect(list[1]).toMatchObject({ id: 3, name: "フシギバナ", nameEn: "venusaur" });
  });

  it("空リポジトリは空配列を返す", () => {
    expect(getPokemonList(makeRepo([]))).toEqual([]);
  });
});

// ── getPokemonDetail ──────────────────────────────────────────────

describe("getPokemonDetail", () => {
  it("存在する ID の詳細を返す", () => {
    const detail = getPokemonDetail(makeRepo([CHARIZARD]), 6);
    expect(detail.id).toBe(6);
    expect(detail.abilities).toHaveLength(2);
    expect(detail.moves).toHaveLength(2);
    expect(detail.moves[0]).toMatchObject({ id: 53, nameEn: "flamethrower" });
  });

  it("存在しない ID は NotFoundError", () => {
    expect(() => getPokemonDetail(makeRepo([CHARIZARD]), 999)).toThrow(NotFoundError);
  });
});

// ── calculateDamage ───────────────────────────────────────────────

describe("calculateDamage", () => {
  const repo = makeRepo([CHARIZARD, VENUSAUR]);

  const baseQuery = {
    attacker: { pokemonId: 6, nature: "timid", statPoints: DEFAULT_SP, abilityNameEn: "blaze", itemNameEn: null, boosts: DEFAULT_BOOSTS },
    defender: { pokemonId: 3, nature: "hardy", statPoints: DEFAULT_SP, abilityNameEn: "overgrow", itemNameEn: null, boosts: DEFAULT_BOOSTS },
    moveNameEn: "flamethrower",
  };

  it("正常系: 計算結果の DTO を返す", () => {
    const calc = makeCalc();
    const result = calculateDamage(repo, calc, baseQuery);
    expect(result.hitCount).toBe(1);
    expect(result.knockoutChance).toBe("guaranteed_no");
    expect(calc.calculate).toHaveBeenCalledOnce();
  });

  it("hitCount を渡すと calculator に転送される", () => {
    const calc = makeCalc();
    calculateDamage(repo, calc, { ...baseQuery, hitCount: 3 });
    expect(calc.calculate).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined,
      3,
    );
  });

  it("攻撃側 pokemonId が存在しない → NotFoundError", () => {
    expect(() =>
      calculateDamage(repo, makeCalc(), { ...baseQuery, attacker: { ...baseQuery.attacker, pokemonId: 999 } })
    ).toThrow(NotFoundError);
  });

  it("防御側 pokemonId が存在しない → NotFoundError", () => {
    expect(() =>
      calculateDamage(repo, makeCalc(), { ...baseQuery, defender: { ...baseQuery.defender, pokemonId: 999 } })
    ).toThrow(NotFoundError);
  });

  it("攻撃側の statPoints が上限超過 → DomainError", () => {
    const badSp = { hp: 32, attack: 32, defense: 10, spAttack: 0, spDefense: 0, speed: 0 }; // 合計74
    expect(() =>
      calculateDamage(repo, makeCalc(), { ...baseQuery, attacker: { ...baseQuery.attacker, statPoints: badSp } })
    ).toThrow(DomainError);
  });

  it("攻撃側の ability が不正 → DomainError", () => {
    expect(() =>
      calculateDamage(repo, makeCalc(), { ...baseQuery, attacker: { ...baseQuery.attacker, abilityNameEn: "torrent" } })
    ).toThrow(DomainError);
  });

  it("わざが攻撃側の learnableMoves にない → NotFoundError", () => {
    expect(() =>
      calculateDamage(repo, makeCalc(), { ...baseQuery, moveNameEn: "solar-beam" })
    ).toThrow(NotFoundError);
  });
});
