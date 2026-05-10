import { describe, it, expect, vi } from "vitest";
import {
  getPokemonList,
  getPokemonDetail,
  calculateDamage,
} from "@/contexts/games/pokemon/damage-calc/application/use-cases";
import { NotFoundError, DomainError } from "@/contexts/games/pokemon/damage-calc/domain/errors";
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

function makeRepo(species: PokemonSpecies[] = [CHARIZARD, VENUSAUR]): PokemonRepository {
  return {
    getAll: () => species,
    getById: (id) => species.find((s) => s.id === id),
  };
}

const DUMMY_RESULT: DamageResult = {
  rolls: Array(16).fill(80),
  hitCount: 1,
  min: 80,
  max: 80,
  percentages: Array(16).fill(80),
  minPercent: 80,
  maxPercent: 80,
  knockoutChance: "guaranteed_no",
};

function makeCalc(result: DamageResult = DUMMY_RESULT): DamageCalculator {
  return { calculate: vi.fn().mockReturnValue(result) };
}

const DEFAULT_SP = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
const DEFAULT_BOOSTS = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

const baseQuery = {
  attacker: {
    pokemonId: 6,
    nature: "timid",
    statPoints: DEFAULT_SP,
    abilityNameEn: "blaze",
    itemNameEn: null as string | null,
    boosts: DEFAULT_BOOSTS,
  },
  defender: {
    pokemonId: 3,
    nature: "hardy",
    statPoints: DEFAULT_SP,
    abilityNameEn: "overgrow",
    itemNameEn: null as string | null,
    boosts: DEFAULT_BOOSTS,
  },
  moveNameEn: "flamethrower",
};

// ── TASK-013: calculateDamage ユースケース ──────────────────────────

describe("TASK-013: Pokémon use-cases — calculateDamage ユースケース", () => {
  it("正常系 — atkSpecies / defSpecies / move がすべて見つかるとき結果が返る", () => {
    const repo = makeRepo();
    const calc = makeCalc();
    const result = calculateDamage(repo, calc, baseQuery);
    expect(result.hitCount).toBe(1);
    expect(result.knockoutChance).toBe("guaranteed_no");
    expect(calc.calculate).toHaveBeenCalledOnce();
  });

  it("攻撃側ポケモンが見つからない — NotFoundError をスローする", () => {
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), { ...baseQuery, attacker: { ...baseQuery.attacker, pokemonId: 999 } })
    ).toThrow(NotFoundError);
  });

  it("防御側ポケモンが見つからない — NotFoundError をスローする", () => {
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), { ...baseQuery, defender: { ...baseQuery.defender, pokemonId: 999 } })
    ).toThrow(NotFoundError);
  });

  it("技が learnableMoves に存在しない — NotFoundError をスローする", () => {
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), { ...baseQuery, moveNameEn: "nonexistent-move" })
    ).toThrow(NotFoundError);
  });

  it("攻撃側 statPoints が無効（合計>66）— DomainError をスローする", () => {
    const badSp = { hp: 32, attack: 32, defense: 10, spAttack: 0, spDefense: 0, speed: 0 }; // total=74
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), { ...baseQuery, attacker: { ...baseQuery.attacker, statPoints: badSp } })
    ).toThrow(DomainError);
  });

  it("防御側 statPoints が無効（値<0）— DomainError をスローする", () => {
    const badSp = { hp: -1, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), { ...baseQuery, defender: { ...baseQuery.defender, statPoints: badSp } })
    ).toThrow(DomainError);
  });

  it("攻撃側 ability が species に存在しない — DomainError をスローする", () => {
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), { ...baseQuery, attacker: { ...baseQuery.attacker, abilityNameEn: "torrent" } })
    ).toThrow(DomainError);
  });

  it("防御側 ability が species に存在しない — DomainError をスローする", () => {
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), { ...baseQuery, defender: { ...baseQuery.defender, abilityNameEn: "blaze" } })
    ).toThrow(DomainError);
  });

  it("itemNameEn=null — item: null として Pokemon を構築する", () => {
    const repo = makeRepo();
    const calc = makeCalc();
    calculateDamage(repo, calc, { ...baseQuery, attacker: { ...baseQuery.attacker, itemNameEn: null } });
    // Verify calc.calculate was called with attacker.item = null
    const callArg = (calc.calculate as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.item).toBeNull();
  });

  it("abilityNameEn が species に見つからないとき — fallback として {name, nameEn} を構築する", () => {
    // When abilityNameEn is not found in species, it creates a fallback ability object.
    // But validateAbility will then throw DomainError.
    // The task says "validateAbility で弾かれるが構築自体は成立" — we test
    // that the error is DomainError (not a crash in ability construction).
    expect(() =>
      calculateDamage(makeRepo(), makeCalc(), {
        ...baseQuery,
        attacker: { ...baseQuery.attacker, abilityNameEn: "unknown-ability" },
      })
    ).toThrow(DomainError);
  });

  it("hitCount を渡す — calc.calculate に hitCount が伝播する", () => {
    const repo = makeRepo();
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

  it("field を渡す — calc.calculate に field が伝播する", () => {
    const repo = makeRepo();
    const calc = makeCalc();
    const field = { weather: "sun" as const, terrain: null };
    calculateDamage(repo, calc, { ...baseQuery, field });
    expect(calc.calculate).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      field,
      undefined,
    );
  });

  it("結果の knockoutChance / rolls / percentages がそのまま DTO として返る", () => {
    const customResult: DamageResult = {
      rolls: [90, 95, 100],
      hitCount: 2,
      min: 90,
      max: 100,
      percentages: [90, 95, 100],
      minPercent: 90,
      maxPercent: 100,
      knockoutChance: "high",
    };
    const repo = makeRepo();
    const calc = makeCalc(customResult);
    const result = calculateDamage(repo, calc, baseQuery);
    expect(result.rolls).toEqual([90, 95, 100]);
    expect(result.knockoutChance).toBe("high");
    expect(result.percentages).toEqual([90, 95, 100]);
    expect(result.minPercent).toBe(90);
    expect(result.maxPercent).toBe(100);
  });
});

// ── TASK-014: getPokemonList / getPokemonDetail ──────────────────────

describe("TASK-014: Pokémon use-cases — getPokemonList / getPokemonDetail", () => {
  const repo = makeRepo();

  it("getPokemonList — 全件を {id, name, nameEn, types, baseStats} に変換して返す", () => {
    const list = getPokemonList(repo);
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({
      id: 6,
      name: "リザードン",
      nameEn: "charizard",
      types: ["fire", "flying"],
    });
    expect(list[0].baseStats).toBeDefined();
    expect(list[1]).toMatchObject({ id: 3, name: "フシギバナ" });
  });

  it("getPokemonDetail — 指定 pokemonId の詳細（abilities / moves 含む）を返す", () => {
    const detail = getPokemonDetail(repo, 6);
    expect(detail.id).toBe(6);
    expect(detail.abilities).toHaveLength(2);
    expect(detail.moves).toHaveLength(2);
  });

  it("getPokemonDetail — 存在しない pokemonId で NotFoundError をスローする", () => {
    expect(() => getPokemonDetail(repo, 999)).toThrow(NotFoundError);
  });

  it("getPokemonDetail の moves — learnableMoves を {id, name, nameEn, power, type, category} に変換する", () => {
    const detail = getPokemonDetail(repo, 6);
    expect(detail.moves[0]).toMatchObject({
      id: 53,
      name: "かえんほうしゃ",
      nameEn: "flamethrower",
      power: 90,
      type: "fire",
      category: "special",
    });
  });
});
