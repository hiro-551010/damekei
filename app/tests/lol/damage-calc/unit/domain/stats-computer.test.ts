import { describe, it, expect } from "vitest";
import { computeStats } from "@/contexts/games/lol/damage-calc/domain/services/stats-computer";
import type {
  Champion,
  ChampionSpecies,
  Item,
  SkillAllocation,
} from "@/contexts/games/lol/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

const LEVEL_ONE = 1;
const LEVEL_EIGHTEEN = 18;
const BASE_AD = 60;
const AD_GROWTH = 3.5;
const BASE_ARMOR = 30;
const ARMOR_GROWTH = 4.5;
const BASE_MR = 32;
const MR_GROWTH = 2.05;

function statAtLevel(base: number, growth: number, level: number): number {
  if (level <= 1) return base;
  return base + growth * (level - 1) * (0.7025 + 0.0175 * (level - 1));
}

function species(): ChampionSpecies {
  return {
    id: "TestChamp",
    name: "テスト",
    nameEn: "Test",
    baseStats: {
      hp: 600,
      ad: BASE_AD,
      armor: BASE_ARMOR,
      magicResist: BASE_MR,
      attackSpeed: 0.625,
      moveSpeed: 325,
    },
    statGrowth: {
      hp: 100,
      ad: AD_GROWTH,
      armor: ARMOR_GROWTH,
      magicResist: MR_GROWTH,
    },
    skills: [],
  };
}

function item(overrides: Partial<Item["stats"]> = {}): Item {
  return {
    id: 1001,
    name: "テストアイテム",
    nameEn: "Test Item",
    stats: {
      ad: null,
      ap: null,
      armor: null,
      magicResist: null,
      hp: null,
      lethality: null,
      armorPenPercent: null,
      magicPenFlat: null,
      magicPenPercent: null,
      attackSpeed: null,
      critChance: null,
      lifeSteal: null,
      abilityHaste: null,
      ...overrides,
    },
    passives: [],
  };
}

function alloc(overrides: Partial<SkillAllocation> = {}): SkillAllocation {
  return { q: 1, w: 0, e: 0, r: 0, ...overrides };
}

function champion(level: number, items: Item[] = []): Champion {
  return {
    species: species(),
    level,
    items,
    skillAllocation: alloc(),
  };
}

// ── computeStats ────────────────────────────────────────────────────

describe("computeStats", () => {
  it("レベル1・アイテムなし: baseAd がそのまま totalAd になる", () => {
    const result = computeStats(champion(LEVEL_ONE));

    expect(result.totalAd).toBe(BASE_AD);
    expect(result.bonusAd).toBe(0);
  });

  it("レベル18・アイテムなし: stat growth 計算が正しい", () => {
    const result = computeStats(champion(LEVEL_EIGHTEEN));

    const expectedAd = statAtLevel(BASE_AD, AD_GROWTH, LEVEL_EIGHTEEN);
    const expectedArmor = statAtLevel(BASE_ARMOR, ARMOR_GROWTH, LEVEL_EIGHTEEN);
    const expectedMr = statAtLevel(BASE_MR, MR_GROWTH, LEVEL_EIGHTEEN);

    expect(result.totalAd).toBeCloseTo(expectedAd, 5);
    expect(result.armor).toBeCloseTo(expectedArmor, 5);
    expect(result.magicResist).toBeCloseTo(expectedMr, 5);
  });

  it("アイテムあり: bonusAd / ap / lethality 等が正しく加算される", () => {
    const BONUS_AD = 40;
    const AP = 90;
    const BONUS_ARMOR = 25;
    const BONUS_MR = 20;
    const LETHALITY = 18;
    const ARMOR_PEN_PERCENT = 30;
    const MAGIC_PEN_FLAT = 12;
    const MAGIC_PEN_PERCENT = 40;

    const result = computeStats(
      champion(LEVEL_ONE, [
        item({
          ad: BONUS_AD,
          ap: AP,
          armor: BONUS_ARMOR,
          magicResist: BONUS_MR,
          lethality: LETHALITY,
          armorPenPercent: ARMOR_PEN_PERCENT,
          magicPenFlat: MAGIC_PEN_FLAT,
          magicPenPercent: MAGIC_PEN_PERCENT,
        }),
      ])
    );

    expect(result.totalAd).toBe(BASE_AD + BONUS_AD);
    expect(result.bonusAd).toBe(BONUS_AD);
    expect(result.ap).toBe(AP);
    expect(result.armor).toBe(BASE_ARMOR + BONUS_ARMOR);
    expect(result.magicResist).toBe(BASE_MR + BONUS_MR);
    expect(result.lethality).toBe(LETHALITY);
    expect(result.armorPenPercent).toBe(ARMOR_PEN_PERCENT);
    expect(result.magicPenFlat).toBe(MAGIC_PEN_FLAT);
    expect(result.magicPenPercent).toBe(MAGIC_PEN_PERCENT);
  });

  it("armorPenPercent は % 値そのまま保持される", () => {
    const ARMOR_PEN_PERCENT = 30;

    const result = computeStats(
      champion(LEVEL_ONE, [item({ armorPenPercent: ARMOR_PEN_PERCENT })])
    );

    expect(result.armorPenPercent).toBe(ARMOR_PEN_PERCENT);
    expect(result.armorPenPercent).not.toBe(0.3);
  });
});
