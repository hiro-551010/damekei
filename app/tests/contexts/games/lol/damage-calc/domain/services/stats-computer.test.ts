import { describe, it, expect } from "vitest";
import { computeStats } from "@/contexts/games/lol/damage-calc/domain/services/stats-computer";
import type {
  Champion,
  ChampionSpecies,
  Item,
  ItemPassive,
  SkillAllocation,
} from "@/contexts/games/lol/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

const BASE_AD = 60;
const AD_GROWTH = 3.5;
const BASE_ARMOR = 30;
const ARMOR_GROWTH = 4.5;
const BASE_MR = 32;
const MR_GROWTH = 2.05;
const BASE_MOVE_SPEED = 325;

function statAtLevel(base: number, growth: number, level: number): number {
  if (level <= 1) return base;
  return base + growth * (level - 1) * (0.7025 + 0.0175 * (level - 1));
}

function makeSpecies(): ChampionSpecies {
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
      moveSpeed: BASE_MOVE_SPEED,
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

function makeItem(
  statsOverrides: Partial<Item["stats"]> = {},
  passives: ItemPassive[] = []
): Item {
  return {
    id: 1001,
    name: "テストアイテム",
    nameEn: "Test Item",
    tier: 3,
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
      ...statsOverrides,
    },
    passives,
  };
}

function makeAlloc(): SkillAllocation {
  return { q: 1, w: 0, e: 0, r: 0 };
}

function makeChampion(level: number, items: Item[] = []): Champion {
  return {
    species: makeSpecies(),
    level,
    items,
    skillAllocation: makeAlloc(),
  };
}

// ── TASK-002: computeStats ───────────────────────────────────────────

describe("TASK-002: StatsComputer — computeStats 関数", () => {
  describe("レベル1でアイテムなし", () => {
    it("baseAd = baseStats.ad そのまま（成長係数ゼロ）", () => {
      const result = computeStats(makeChampion(1));
      expect(result.baseAd).toBe(BASE_AD);
    });

    it("bonusAd = 0", () => {
      const result = computeStats(makeChampion(1));
      expect(result.bonusAd).toBe(0);
    });

    it("armor が baseStats.armor に一致する", () => {
      const result = computeStats(makeChampion(1));
      expect(result.armor).toBe(BASE_ARMOR);
    });
  });

  describe("レベル18でアイテムなし", () => {
    it("baseAd が成長公式 base + growth * 17 * (0.7025 + 0.0175 * 17) に一致する", () => {
      const result = computeStats(makeChampion(18));
      const expected = statAtLevel(BASE_AD, AD_GROWTH, 18);
      expect(result.baseAd).toBeCloseTo(expected, 5);
    });

    it("totalAd = baseAd + bonusAd", () => {
      const result = computeStats(makeChampion(18));
      expect(result.totalAd).toBeCloseTo(result.baseAd + result.bonusAd, 5);
    });

    it("armor が成長を含んだ値に一致する", () => {
      const result = computeStats(makeChampion(18));
      const expected = statAtLevel(BASE_ARMOR, ARMOR_GROWTH, 18);
      expect(result.armor).toBeCloseTo(expected, 5);
    });
  });

  describe("アイテムなし — 各種ステータスが 0", () => {
    it("ap = 0", () => {
      const result = computeStats(makeChampion(1));
      expect(result.ap).toBe(0);
    });

    it("lethality = 0, armorPenPercent = 0, magicPenFlat = 0, magicPenPercent = 0, critChance = 0", () => {
      const result = computeStats(makeChampion(1));
      expect(result.lethality).toBe(0);
      expect(result.armorPenPercent).toBe(0);
      expect(result.magicPenFlat).toBe(0);
      expect(result.magicPenPercent).toBe(0);
      expect(result.critChance).toBe(0);
    });
  });

  describe("アイテム複数", () => {
    it("bonusAd が各アイテム stats.ad の合算に一致する", () => {
      const items = [makeItem({ ad: 40 }), makeItem({ ad: 30 })];
      const result = computeStats(makeChampion(1, items));
      expect(result.bonusAd).toBe(70);
    });

    it("ap が各アイテム stats.ap の合算に一致する", () => {
      const items = [makeItem({ ap: 80 }), makeItem({ ap: 40 })];
      const result = computeStats(makeChampion(1, items));
      expect(result.ap).toBe(120);
    });

    it("lethality が各アイテム stats.lethality の合算に一致する", () => {
      const items = [makeItem({ lethality: 10 }), makeItem({ lethality: 8 })];
      const result = computeStats(makeChampion(1, items));
      expect(result.lethality).toBe(18);
    });

    it("critChance が各アイテム stats.critChance の合算に一致する", () => {
      const items = [makeItem({ critChance: 20 }), makeItem({ critChance: 20 })];
      const result = computeStats(makeChampion(1, items));
      expect(result.critChance).toBe(40);
    });
  });

  describe("アイテム stats が null", () => {
    it("null フィールドを 0 として合算する", () => {
      const items = [makeItem({ ad: null, ap: null, lethality: null })];
      const result = computeStats(makeChampion(1, items));
      expect(result.bonusAd).toBe(0);
      expect(result.ap).toBe(0);
      expect(result.lethality).toBe(0);
    });
  });

  describe("apAmp パッシブ", () => {
    it("apAmp パッシブあり — ap が合算 AP に (1 + apAmpTotal) を乗じた値に一致する", () => {
      // AP=100, apAmp ratio=0.30 → ap = 100 * 1.30 = 130
      const items = [makeItem({ ap: 100 }, [{ kind: "apAmp", ratio: 0.30 }])];
      const result = computeStats(makeChampion(1, items));
      expect(result.ap).toBeCloseTo(130, 5);
    });

    it("apAmp パッシブ複数 — ratio が累算されて正しく ap に適用される", () => {
      // AP=100, apAmp 0.20 + 0.10 = 0.30 → 100 * 1.30 = 130
      const items = [
        makeItem({ ap: 100 }, [{ kind: "apAmp", ratio: 0.20 }]),
        makeItem({}, [{ kind: "apAmp", ratio: 0.10 }]),
      ];
      const result = computeStats(makeChampion(1, items));
      expect(result.ap).toBeCloseTo(130, 5);
    });

    it("apAmp パッシブなし — ap が素の合算値のまま", () => {
      const items = [makeItem({ ap: 80 })];
      const result = computeStats(makeChampion(1, items));
      expect(result.ap).toBe(80);
    });
  });

  describe("moveSpeed", () => {
    it("moveSpeed — species.baseStats.moveSpeed がそのまま入る（bonusMoveSpeed = 0）", () => {
      const result = computeStats(makeChampion(1));
      expect(result.moveSpeed).toBe(BASE_MOVE_SPEED);
      expect(result.bonusMoveSpeed).toBe(0);
    });
  });

  describe("bonusArmor / bonusMagicResist", () => {
    it("アイテム由来の値が正しく分離される", () => {
      const items = [makeItem({ armor: 25, magicResist: 20 })];
      const result = computeStats(makeChampion(1, items));
      expect(result.bonusArmor).toBe(25);
      expect(result.bonusMagicResist).toBe(20);
      // total armor = base + bonus
      expect(result.armor).toBeCloseTo(BASE_ARMOR + 25, 5);
      expect(result.magicResist).toBeCloseTo(BASE_MR + 20, 5);
    });
  });
});
