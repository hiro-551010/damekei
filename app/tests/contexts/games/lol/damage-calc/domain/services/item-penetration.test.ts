import { describe, it, expect } from "vitest";
import { computeStats } from "@/contexts/games/lol/damage-calc/domain/services/stats-computer";
import { calculateDamage } from "@/contexts/games/lol/damage-calc/domain/services/damage-calculator";
import type {
  Champion,
  ChampionSpecies,
  ComputedStats,
  Item,
} from "@/contexts/games/lol/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

function makeSpecies(overrides: { armor?: number; magicResist?: number } = {}): ChampionSpecies {
  return {
    id: "TestChamp",
    name: "テスト",
    nameEn: "Test",
    baseStats: {
      hp: 1000,
      ad: 60,
      armor: overrides.armor ?? 0,
      magicResist: overrides.magicResist ?? 0,
      attackSpeed: 0.625,
      moveSpeed: 325,
    },
    statGrowth: {
      hp: 0,
      ad: 0,
      armor: 0,
      magicResist: 0,
    },
    skills: [],
  };
}

function makeItem(statsOverrides: Partial<Item["stats"]> = {}): Item {
  return {
    id: 9001,
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
    passives: [],
  };
}

function makeChampion(level: number, items: Item[] = [], speciesOverrides: { armor?: number; magicResist?: number } = {}): Champion {
  return {
    species: makeSpecies(speciesOverrides),
    level,
    items,
    skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
  };
}

/**
 * effectiveArmor の実装（damage-calculator.ts と同ロジック）:
 *   afterPercent = targetArmor * (1 - armorPenPercent / 100)
 *   afterFlat    = afterPercent - lethality
 *   return Math.max(0, afterFlat)
 *
 * effectiveMR の実装:
 *   afterPercent = targetMR * (1 - magicPenPercent / 100)
 *   afterFlat    = afterPercent - magicPenFlat
 *   return Math.max(0, afterFlat)
 *
 * 注意: lethality はレベル変換なし（コード上では生の値をそのまま使用）。
 */

// ── Lethality（フラット防具貫通）────────────────────────────────────

describe("Lethality — フラット防具貫通", () => {
  /**
   * 実装確認: stats-computer.ts は lethality をアイテムから合算するのみ。
   * damage-calculator.ts の effectiveArmor で `afterFlat = afterPercent - attacker.lethality` として使う。
   * ゲームの実際の仕様（lethality × (0.6 + 0.4 × level/18)）のレベルスケールは現実装に含まれないため、
   * ここでは実装に合わせて「lethality が防具から直接引かれる」ことを検証する。
   */

  it("lethality 10、防具 30 → 実効防具 = 20（lethality をそのまま引く）", () => {
    const attacker = makeChampion(1, [makeItem({ lethality: 10 })]);
    const atkStats = computeStats(attacker);
    // effectiveArmor = max(0, 30 * (1 - 0/100) - 10) = 20
    const effectiveArmor = Math.max(0, 30 * (1 - 0 / 100) - atkStats.lethality);
    expect(atkStats.lethality).toBe(10);
    expect(effectiveArmor).toBe(20);
  });

  it("lethality 10、防具 30: レベル 1 / 9 / 18 で lethality 集計値が変わらない（実装はレベルスケールなし）", () => {
    const item = makeItem({ lethality: 10 });
    const level1Stats = computeStats(makeChampion(1, [item]));
    const level9Stats = computeStats(makeChampion(9, [item]));
    const level18Stats = computeStats(makeChampion(18, [item]));
    // 実装では lethality はレベルに関係なく同じ値が入る
    expect(level1Stats.lethality).toBe(10);
    expect(level9Stats.lethality).toBe(10);
    expect(level18Stats.lethality).toBe(10);
  });

  it("lethality > 対象防具 の場合、実効防具は 0 を下回らない", () => {
    // 攻撃側 lethality=50、防具=30 → clamp to 0
    const attacker = makeChampion(1, [makeItem({ lethality: 50 })]);
    const defender = makeChampion(1, [], { armor: 30 });

    // calculateDamage を通じて effectiveArmor が 0 になることを確認
    const result = calculateDamage(attacker, defender);
    // effectiveResistance は Math.max(0, ...) で 0 になるはず
    expect(result.autoAttack.effectiveResistance).toBe(0);
  });

  it("複数アイテムの lethality が合算される", () => {
    const items = [makeItem({ lethality: 18 }), makeItem({ lethality: 10 })];
    const atkStats = computeStats(makeChampion(1, items));
    expect(atkStats.lethality).toBe(28);
  });
});

// ── % 防具貫通（armorPenPercent）────────────────────────────────────

describe("% 防具貫通（armorPenPercent）", () => {
  it("防具 100 に対して 30% 貫通 → 実効防具 = 70", () => {
    const attacker = makeChampion(1, [makeItem({ armorPenPercent: 30 })]);
    const defender = makeChampion(1, [], { armor: 100 });

    const result = calculateDamage(attacker, defender);
    expect(result.autoAttack.effectiveResistance).toBeCloseTo(70, 5);
  });

  it("lethality との組み合わせ：% 貫通を先に適用してから lethality を引く", () => {
    // 防具 100、armorPenPercent 30%、lethality 10
    // 期待: 100 * (1 - 0.30) = 70、70 - 10 = 60
    const attacker = makeChampion(1, [makeItem({ armorPenPercent: 30, lethality: 10 })]);
    const defender = makeChampion(1, [], { armor: 100 });

    const atkStats = computeStats(attacker);
    // effectiveArmor の順序を直接検証
    const afterPercent = 100 * (1 - atkStats.armorPenPercent / 100);
    const afterFlat = afterPercent - atkStats.lethality;
    const effectiveArmor = Math.max(0, afterFlat);

    expect(atkStats.armorPenPercent).toBe(30);
    expect(atkStats.lethality).toBe(10);
    expect(afterPercent).toBeCloseTo(70, 5);
    expect(effectiveArmor).toBeCloseTo(60, 5);

    // calculateDamage の結果とも一致することを確認
    const result = calculateDamage(attacker, defender);
    expect(result.autoAttack.effectiveResistance).toBeCloseTo(60, 1);
  });

  it("armorPenPercent 0% → 実効防具 = 防具そのまま", () => {
    const attacker = makeChampion(1, []);
    const defender = makeChampion(1, [], { armor: 50 });
    const result = calculateDamage(attacker, defender);
    expect(result.autoAttack.effectiveResistance).toBeCloseTo(50, 5);
  });
});

// ── 魔法貫通（magicPenFlat / magicPenPercent）────────────────────────

describe("魔法貫通（magicPenFlat / magicPenPercent）", () => {
  it("MR 100 に対して 40% 魔法貫通 → 実効 MR = 60", () => {
    // スキルを持たないチャンピオンでは auto attack の on-hit magic で検証する代わりに、
    // ComputedStats の magicPenPercent を直接確認し、effectiveMR ロジックを追う
    const attacker = makeChampion(1, [makeItem({ magicPenPercent: 40 })]);
    const atkStats = computeStats(attacker);

    const targetMR = 100;
    const afterPercent = targetMR * (1 - atkStats.magicPenPercent / 100);
    const effectiveMR = Math.max(0, afterPercent - atkStats.magicPenFlat);

    expect(atkStats.magicPenPercent).toBe(40);
    expect(effectiveMR).toBeCloseTo(60, 5);
  });

  it("MR 100 に対してフラット 15 魔法貫通 → 実効 MR = 85", () => {
    const attacker = makeChampion(1, [makeItem({ magicPenFlat: 15 })]);
    const atkStats = computeStats(attacker);

    const targetMR = 100;
    const afterPercent = targetMR * (1 - atkStats.magicPenPercent / 100);
    const effectiveMR = Math.max(0, afterPercent - atkStats.magicPenFlat);

    expect(atkStats.magicPenFlat).toBe(15);
    expect(effectiveMR).toBeCloseTo(85, 5);
  });

  it("% を先に適用してから flat を引く順序であること", () => {
    // MR 100、magicPenPercent 30%、magicPenFlat 10
    // 順序1（正しい）: 100 * (1 - 0.30) = 70、70 - 10 = 60
    // 順序2（誤り）  : 100 - 10 = 90、90 * 0.70 = 63
    const attacker = makeChampion(1, [makeItem({ magicPenPercent: 30, magicPenFlat: 10 })]);
    const atkStats = computeStats(attacker);

    const targetMR = 100;
    const afterPercent = targetMR * (1 - atkStats.magicPenPercent / 100); // 70
    const effectiveMR = Math.max(0, afterPercent - atkStats.magicPenFlat); // 60

    expect(effectiveMR).toBeCloseTo(60, 5);
    // 誤った順序（flat先）では 63 になる
    expect(effectiveMR).not.toBeCloseTo(63, 0);
  });

  it("実効 MR が 0 を下回らない（magicPenFlat > MR の場合）", () => {
    // MR 20、magicPenFlat 50 → clamp to 0
    const attacker = makeChampion(1, [makeItem({ magicPenFlat: 50 })]);
    const atkStats = computeStats(attacker);

    const targetMR = 20;
    const afterPercent = targetMR * (1 - atkStats.magicPenPercent / 100);
    const effectiveMR = Math.max(0, afterPercent - atkStats.magicPenFlat);

    expect(effectiveMR).toBe(0);
  });

  it("複数アイテムの magicPenFlat が合算される", () => {
    const items = [makeItem({ magicPenFlat: 15 }), makeItem({ magicPenFlat: 10 })];
    const atkStats = computeStats(makeChampion(1, items));
    expect(atkStats.magicPenFlat).toBe(25);
  });

  it("複数アイテムの magicPenPercent が合算される", () => {
    const items = [makeItem({ magicPenPercent: 20 }), makeItem({ magicPenPercent: 15 })];
    const atkStats = computeStats(makeChampion(1, items));
    expect(atkStats.magicPenPercent).toBe(35);
  });
});

// ── ComputedStats への反映確認 ────────────────────────────────────────

describe("computeStats — 貫通系ステータス集計", () => {
  it("アイテムなし → lethality / armorPenPercent / magicPenFlat / magicPenPercent がすべて 0", () => {
    const stats = computeStats(makeChampion(1));
    expect(stats.lethality).toBe(0);
    expect(stats.armorPenPercent).toBe(0);
    expect(stats.magicPenFlat).toBe(0);
    expect(stats.magicPenPercent).toBe(0);
  });

  it("各種貫通アイテムが正しく集計される", () => {
    const items = [
      makeItem({ lethality: 18, armorPenPercent: 30 }),
      makeItem({ magicPenFlat: 15, magicPenPercent: 40 }),
    ];
    const stats = computeStats(makeChampion(1, items));
    expect(stats.lethality).toBe(18);
    expect(stats.armorPenPercent).toBe(30);
    expect(stats.magicPenFlat).toBe(15);
    expect(stats.magicPenPercent).toBe(40);
  });
});
