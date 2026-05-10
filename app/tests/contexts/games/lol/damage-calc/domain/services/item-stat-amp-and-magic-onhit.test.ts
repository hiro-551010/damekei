import { describe, it, expect } from "vitest";
import { calculateDamage } from "@/contexts/games/lol/damage-calc/domain/services/damage-calculator";
import type {
  Champion,
  ChampionSpecies,
  Item,
  ItemPassive,
  SkillAllocation,
  SkillDamageSpec,
} from "@/contexts/games/lol/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

const BASE_AD = 50;
const BASE_HP = 1000;

function makeItem(statsOverrides: Partial<Item["stats"]> = {}, passives: ItemPassive[] = []): Item {
  return {
    id: 9999,
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

function makeSpecies(overrides?: Partial<ChampionSpecies>): ChampionSpecies {
  return {
    id: "TestChamp",
    name: "テスト",
    nameEn: "Test",
    baseStats: { hp: BASE_HP, ad: BASE_AD, armor: 0, magicResist: 0, attackSpeed: 0.625, moveSpeed: 325 },
    statGrowth: { hp: 0, ad: 0, armor: 0, magicResist: 0 },
    skills: [],
    ...overrides,
  };
}

function makeAttacker(items: Item[] = [], skillsOverride?: SkillDamageSpec[]): Champion {
  return {
    species: makeSpecies({ skills: skillsOverride ?? [] }),
    level: 1,
    items,
    skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
  };
}

function makeDefender(armor = 0, magicResist = 0, hp = BASE_HP): Champion {
  return {
    species: makeSpecies({ baseStats: { hp, ad: BASE_AD, armor, magicResist, attackSpeed: 0.625, moveSpeed: 325 } }),
    level: 1,
    items: [],
    skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
  };
}

function makeApSkill(slot: "Q" | "W" | "E" | "R"): SkillDamageSpec {
  // damage = 1.0 * ap（AP スケール 100%）
  return {
    slot,
    name: `${slot} AP Skill`,
    damageType: "magic",
    damageFormula: { kind: "stat", ref: "attacker.ap" },
  };
}

function alloc(overrides: Partial<SkillAllocation> = {}): SkillAllocation {
  return { q: 0, w: 0, e: 0, r: 0, ...overrides };
}

function mitigate(pre: number, resistance: number): number {
  return pre * (100 / (100 + resistance));
}

// ── apAmp（Rabadon's Deathcap 3089: ratio 0.30）──────────────────────

describe("apAmp（Rabadon's Deathcap 3089）", () => {
  const rabadon = makeItem({ ap: 0 }, [{ kind: "apAmp", ratio: 0.30 }]);

  it("AP 100 のアイテムに apAmp 0.30 を追加 → ap が 130 になる（スキルダメージで間接確認）", () => {
    // AP スケール 100% のスキル: damage = ap
    // AP 100 * (1 + 0.30) = 130 → preMitigation = 130
    const apItem = makeItem({ ap: 100 });
    const attacker: Champion = {
      species: makeSpecies({ skills: [makeApSkill("Q")] }),
      level: 1,
      items: [apItem, rabadon],
      skillAllocation: alloc({ q: 1 }),
    };
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.skills[0].preMitigation).toBe(130);
  });

  it("apAmp なしのとき AP 100 → スキルダメージ preMitigation = 100（対照テスト）", () => {
    const apItem = makeItem({ ap: 100 });
    const attacker: Champion = {
      species: makeSpecies({ skills: [makeApSkill("Q")] }),
      level: 1,
      items: [apItem],
      skillAllocation: alloc({ q: 1 }),
    };
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.skills[0].preMitigation).toBe(100);
  });

  it("AP スケールスキルのダメージが 1.30 倍になること（MR=0）", () => {
    const apItem = makeItem({ ap: 200 });
    const attacker: Champion = {
      species: makeSpecies({ skills: [makeApSkill("Q")] }),
      level: 1,
      items: [apItem, rabadon],
      skillAllocation: alloc({ q: 1 }),
    };
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    // AP = 200 * 1.30 = 260
    expect(result.skills[0].preMitigation).toBe(260);
  });

  it("apAmp が複数あるとき ratioが合算される（ratio 0.30 + 0.30 → ap * 1.60）", () => {
    const rabadon2 = makeItem({ ap: 0 }, [{ kind: "apAmp", ratio: 0.30 }]);
    const apItem = makeItem({ ap: 100 });
    const attacker: Champion = {
      species: makeSpecies({ skills: [makeApSkill("Q")] }),
      level: 1,
      items: [apItem, rabadon, rabadon2],
      skillAllocation: alloc({ q: 1 }),
    };
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    // AP = 100 * (1 + 0.30 + 0.30) = 160
    expect(result.skills[0].preMitigation).toBe(160);
  });
});

// ── critDamageAmp（Infinity Edge 3031: bonusFactor 0.35, minCritChance 40）──

describe("critDamageAmp（Infinity Edge 3031）", () => {
  it("クリット率 0% のとき → critPostMitigation は null（IE 効果なし）", () => {
    // critChance=0 → hasCrit=false → critPostMitigation=null
    const ie = makeItem({}, [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 }]);
    const attacker = makeAttacker([ie]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.critPostMitigation).toBeNull();
  });

  it("クリット率 39%（minCritChance 未満）→ critDamageAmp が適用されず multiplier = 1.75", () => {
    // critChance=39 < minCritChance=40 → bonusCritFactor=0 → multiplier=1.75
    const ie = makeItem({ critChance: 39 }, [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 }]);
    const attacker = makeAttacker([ie]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 1.75));
  });

  it("クリット率 40%（minCritChance ちょうど）→ critDamageAmp が適用されて multiplier = 2.10", () => {
    // critChance=40 >= minCritChance=40 → bonusCritFactor=0.35 → multiplier=1.75+0.35=2.10
    const ie = makeItem({ critChance: 40 }, [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 }]);
    const attacker = makeAttacker([ie]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 2.10));
  });

  it("クリット率 60%（minCritChance 超過）→ critDamageAmp が適用されて multiplier = 2.10", () => {
    const ie = makeItem({ critChance: 60 }, [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 }]);
    const attacker = makeAttacker([ie]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 2.10));
  });

  it("クリット率 40%、アーマー 60 → critPostMitigation が Math.round(AD * 2.10 をミティゲーション) に一致する", () => {
    const ie = makeItem({ critChance: 40 }, [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 }]);
    const attacker = makeAttacker([ie]);
    const def = makeDefender(60, 0);
    const result = calculateDamage(attacker, def);
    const critPreMit = BASE_AD * 2.10;
    const expected = Math.round(mitigate(critPreMit, 60));
    expect(result.autoAttack.critPostMitigation).toBe(expected);
  });
});

// ── onHitMagicDamage（Wit's End 3091: damage 45）─────────────────────

describe("onHitMagicDamage（Wit's End 3091）", () => {
  const witsEnd = makeItem({}, [{ kind: "onHitMagicDamage", damage: 45 }]);

  it("Wit's End 装備時 → onHitMagicPostMitigation が null でない", () => {
    const attacker = makeAttacker([witsEnd]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.onHitMagicPostMitigation).not.toBeNull();
  });

  it("MR 0 のとき → onHitMagicPostMitigation = 45（軽減なし）", () => {
    const attacker = makeAttacker([witsEnd]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(45);
  });

  it("MR 50 のとき → onHitMagicPostMitigation = Math.round(45 * 100/150)", () => {
    const attacker = makeAttacker([witsEnd]);
    const def = makeDefender(0, 50);
    const result = calculateDamage(attacker, def);
    const expected = Math.round(mitigate(45, 50));
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(expected);
  });

  it("2個装備 → onHitMagicPostMitigation が 1個の 2倍（MR=0 で 90）", () => {
    const witsEnd2 = makeItem({}, [{ kind: "onHitMagicDamage", damage: 45 }]);
    const attacker = makeAttacker([witsEnd, witsEnd2]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(90);
  });

  it("Wit's End なし → onHitMagicPostMitigation = null", () => {
    const attacker = makeAttacker([]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    expect(result.autoAttack.onHitMagicPostMitigation).toBeNull();
  });
});

// ── onHitMagicDamageScaled（Nashor's Tooth 3115: base 15, apRatio 0.15）──

describe("onHitMagicDamageScaled（Nashor's Tooth 3115）", () => {
  it("AP 0 のとき → オンヒット魔法ダメージ元 = 15（base のみ）", () => {
    const nashor = makeItem({}, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
    const attacker = makeAttacker([nashor]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    // damage = 15 + 0.15 * 0 = 15
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(15);
  });

  it("AP 100 のとき → オンヒット魔法ダメージ元 = 15 + 0.15 * 100 = 30", () => {
    const nashor = makeItem({ ap: 100 }, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
    const attacker = makeAttacker([nashor]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    // damage = 15 + 0.15 * 100 = 30
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(30);
  });

  it("AP 100 + Rabadon（apAmp 0.30）→ AP が 130 になり onHit = 15 + 0.15 * 130 = 34.5 → Math.round = 35", () => {
    // AP = 100 * (1 + 0.30) = 130
    // onHit preMit = 15 + 0.15 * 130 = 34.5
    const nashor = makeItem({ ap: 100 }, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
    const rabadon = makeItem({}, [{ kind: "apAmp", ratio: 0.30 }]);
    const attacker = makeAttacker([nashor, rabadon]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    const apAfterAmp = 100 * (1 + 0.30);
    const preMit = 15 + 0.15 * apAfterAmp;
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(Math.round(preMit));
  });

  it("MR あり → MR で軽減された値になること", () => {
    const nashor = makeItem({ ap: 100 }, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
    const attacker = makeAttacker([nashor]);
    const def = makeDefender(0, 60);
    const result = calculateDamage(attacker, def);
    // preMit = 15 + 0.15 * 100 = 30, MR=60 → 30 * 100/160 ≈ 18.75 → 19
    const expected = Math.round(mitigate(30, 60));
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(expected);
  });

  it("onHitMagicDamage（flat）と onHitMagicDamageScaled の合算 → 両方の pre ミティゲーション値が合算される", () => {
    // witsEnd: damage=45, nashor: base=15 + 0.15*100=30 → total preMit=75, MR=0
    const witsEnd = makeItem({}, [{ kind: "onHitMagicDamage", damage: 45 }]);
    const nashor = makeItem({ ap: 100 }, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
    const attacker = makeAttacker([witsEnd, nashor]);
    const def = makeDefender(0, 0);
    const result = calculateDamage(attacker, def);
    // 45 + 30 = 75
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(75);
  });
});
