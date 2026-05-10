import { describe, it, expect } from "vitest";
import { calculateDamage } from "@/contexts/games/lol/damage-calc/domain/services/damage-calculator";
import type {
  Champion,
  ChampionSpecies,
  Item,
  ItemPassive,
  SkillAllocation,
  SkillDamageSpec,
  AACritOverride,
} from "@/contexts/games/lol/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

const BASE_AD = 50;
const BASE_ARMOR = 60;
const BASE_MR = 60;
const BASE_HP = 600;

function makeSkill(
  slot: "Q" | "W" | "E" | "R",
  damageType: "physical" | "magic" | "true",
  damage: number
): SkillDamageSpec {
  return {
    slot,
    name: `${slot} Skill`,
    damageType,
    damageFormula: { kind: "const", value: damage },
  };
}

function makeItem(statsOverrides: Partial<Item["stats"]> = {}, passives: ItemPassive[] = []): Item {
  return {
    id: 2001,
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

function makeSpecies(
  skills: SkillDamageSpec[],
  armor = BASE_ARMOR,
  magicResist = BASE_MR,
  hp = BASE_HP,
  aaCritOverride?: AACritOverride,
  overrides?: Partial<ChampionSpecies>
): ChampionSpecies {
  return {
    id: "TestChamp",
    name: "テスト",
    nameEn: "Test",
    baseStats: { hp, ad: BASE_AD, armor, magicResist, attackSpeed: 0.625, moveSpeed: 325 },
    statGrowth: { hp: 0, ad: 0, armor: 0, magicResist: 0 },
    skills,
    ...(aaCritOverride && { aaCritOverride }),
    ...overrides,
  };
}

function makeAttacker(
  skills: SkillDamageSpec[],
  skillAllocation: SkillAllocation,
  items: Item[] = [],
  level = 1,
  speciesOverrides?: Partial<ChampionSpecies>
): Champion {
  return {
    species: makeSpecies(skills, 30, 30, BASE_HP, undefined, speciesOverrides),
    level,
    items,
    skillAllocation,
  };
}

function makeDefender(armor = BASE_ARMOR, magicResist = BASE_MR, hp = BASE_HP): Champion {
  return {
    species: makeSpecies([], armor, magicResist, hp),
    level: 1,
    items: [],
    skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
  };
}

function alloc(overrides: Partial<SkillAllocation> = {}): SkillAllocation {
  return { q: 1, w: 1, e: 1, r: 1, ...overrides };
}

function mitigate(pre: number, resistance: number) {
  return pre * (100 / (100 + resistance));
}

function effectiveArmor(armor: number, armorPenPercent: number, lethality: number) {
  const afterPercent = armor * (1 - armorPenPercent / 100);
  const afterFlat = afterPercent - lethality;
  return Math.max(0, afterFlat);
}

function effectiveMagicResist(mr: number, magicPenPercent: number, magicPenFlat: number) {
  const afterPercent = mr * (1 - magicPenPercent / 100);
  const afterFlat = afterPercent - magicPenFlat;
  return Math.max(0, afterFlat);
}

// ── 3-a: effectiveArmor / effectiveMagicResist（間接テスト）────────────

describe("TASK-003: DamageCalculator", () => {
  describe("3-a: effectiveArmor / effectiveMagicResist（間接テスト）", () => {
    it("armorPenPercent=0, lethality=0 — armor がそのまま返る", () => {
      const atk = makeAttacker([makeSkill("Q", "physical", 100)], alloc({ q: 1, w: 0, e: 0, r: 0 }));
      const def = makeDefender(60, 0);
      const result = calculateDamage(atk, def);
      const skill = result.skills[0];
      expect(skill.effectiveResistance).toBe(60);
    });

    it("armorPenPercent=20, lethality=0 — armor * 0.8 に一致する", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "physical", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 }),
        [makeItem({ armorPenPercent: 20 })]
      );
      const def = makeDefender(60, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].effectiveResistance).toBeCloseTo(48, 1);
    });

    it("lethality=30, armorPenPercent=0 — armor - 30 に一致する", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "physical", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 }),
        [makeItem({ lethality: 30 })]
      );
      const def = makeDefender(60, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].effectiveResistance).toBe(30);
    });

    it("貫通適用後が 0 未満になるとき — クランプされて 0 を返す", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "physical", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 }),
        [makeItem({ lethality: 100 })]
      );
      const def = makeDefender(50, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].effectiveResistance).toBe(0);
    });

    it("magicPenPercent=15, magicPenFlat=10 — 計算順序（%→flat）が正しい", () => {
      // armor=0, mr=80. afterPercent = 80 * (1 - 0.15) = 68, afterFlat = 68 - 10 = 58
      const atk = makeAttacker(
        [makeSkill("Q", "magic", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 }),
        [makeItem({ magicPenPercent: 15, magicPenFlat: 10 })]
      );
      const def = makeDefender(0, 80);
      const result = calculateDamage(atk, def);
      const expected = Math.round(80 * (1 - 15 / 100) - 10);
      expect(result.skills[0].effectiveResistance).toBeCloseTo(expected, 0);
    });

    it("魔法貫通後が 0 未満になるとき — クランプされて 0 を返す", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "magic", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 }),
        [makeItem({ magicPenFlat: 100 })]
      );
      const def = makeDefender(0, 30);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].effectiveResistance).toBe(0);
    });
  });

  // ── 3-b: mitigate（間接テスト）──────────────────────────────────────

  describe("3-b: mitigate（間接テスト）", () => {
    it("resistance=0 — ダメージが変化しない", () => {
      // true damage で effectiveResistance=0、postMitigation=preMitigation のケース
      const atk = makeAttacker([makeSkill("Q", "true", 150)], alloc({ q: 1, w: 0, e: 0, r: 0 }));
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].preMitigation).toBe(150);
      expect(result.skills[0].postMitigation).toBe(150);
    });

    it("resistance=100 — ダメージが 50% に減少する", () => {
      const atk = makeAttacker([makeSkill("Q", "physical", 200)], alloc({ q: 1, w: 0, e: 0, r: 0 }));
      const def = makeDefender(100, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].postMitigation).toBe(Math.round(200 * 100 / 200));
    });

    it("resistance=300 — ダメージが 25% に減少する", () => {
      const atk = makeAttacker([makeSkill("Q", "physical", 400)], alloc({ q: 1, w: 0, e: 0, r: 0 }));
      const def = makeDefender(300, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].postMitigation).toBe(Math.round(400 * 100 / 400));
    });
  });

  // ── 3-c: calculateAutoAttack（通常 AA）──────────────────────────────

  describe("3-c: calculateAutoAttack（通常 AA）", () => {
    const AA_DEF_ARMOR = 60;
    const AA_DEF_MR = 60;

    it("基本ケース — preMitigation = atkStats.totalAd に一致する", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender(AA_DEF_ARMOR, AA_DEF_MR);
      const result = calculateDamage(atk, def);
      // totalAd = baseAd = BASE_AD = 50 (no bonus, growth=0)
      expect(result.autoAttack.preMitigation).toBe(BASE_AD);
    });

    it("基本ケース — effectiveResistance が effectiveArmor(defStats.armor, atkStats) に一致する", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender(AA_DEF_ARMOR, AA_DEF_MR);
      const result = calculateDamage(atk, def);
      // attacker has armorPenPercent=0, lethality=0 → effectiveArmor = 60
      expect(result.autoAttack.effectiveResistance).toBe(AA_DEF_ARMOR);
    });

    it("基本ケース — postMitigation が mitigate(preMitigation, effArmor) を Math.round したものに一致する", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender(AA_DEF_ARMOR, AA_DEF_MR);
      const result = calculateDamage(atk, def);
      const expected = Math.round(mitigate(BASE_AD, AA_DEF_ARMOR));
      expect(result.autoAttack.postMitigation).toBe(expected);
    });

    it("基本ケース — reductionPercent が正しい計算値（小数点1桁丸め）に一致する", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender(AA_DEF_ARMOR, AA_DEF_MR);
      const result = calculateDamage(atk, def);
      const pre = BASE_AD;
      const post = mitigate(BASE_AD, AA_DEF_ARMOR);
      const expected = Math.round(((pre - post) / pre) * 100 * 10) / 10;
      expect(result.autoAttack.reductionPercent).toBe(expected);
    });

    it("基本ケース — hpPercent が正しい計算値（小数点1桁丸め）に一致する", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender(AA_DEF_ARMOR, AA_DEF_MR);
      const result = calculateDamage(atk, def);
      const post = mitigate(BASE_AD, AA_DEF_ARMOR);
      const expected = Math.round((post / BASE_HP) * 100 * 10) / 10;
      expect(result.autoAttack.hpPercent).toBe(expected);
    });

    it("critChance=0 かつ aaCritOverride なし — critPostMitigation / critHpPercent が null", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender();
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.critPostMitigation).toBeNull();
      expect(result.autoAttack.critHpPercent).toBeNull();
    });

    it("critChance>0 — critPostMitigation が totalAd * 1.75 をミティゲーションした値に一致する", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }), [makeItem({ critChance: 20 })]);
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      const expected = Math.round(BASE_AD * 1.75);
      expect(result.autoAttack.critPostMitigation).toBe(expected);
    });

    it("aaCritOverride.alwaysCrit=true — critPostMitigation が非 null", () => {
      const atk: Champion = {
        species: makeSpecies([], 30, 30, BASE_HP, { alwaysCrit: true, baseMultiplier: 1.75 }),
        level: 1,
        items: [],
        skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }),
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.critPostMitigation).not.toBeNull();
    });

    it("aaCritOverride.baseMultiplier=2.0 — critMultiplier に 2.0 が使用される", () => {
      const atk: Champion = {
        species: makeSpecies([], 30, 30, BASE_HP, { alwaysCrit: true, baseMultiplier: 2.0 }),
        level: 1,
        items: [],
        skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }),
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 2.0));
    });

    it("`critDamageAmp` パッシブ条件満たす — bonusCritFactor が加算されたクリット倍率に一致する", () => {
      // critChance=60 >= minCritChance=40, bonusFactor=0.35 → multiplier = 1.75 + 0.35 = 2.10
      const ie = makeItem({ critChance: 60 }, [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 }]);
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }), [ie]);
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 2.10));
    });

    it("`critDamageAmp` パッシブ条件不満たす（critChance < minCritChance）— bonusFactor が加算されない", () => {
      // critChance=50 < minCritChance=60 → multiplier = 1.75
      const ie = makeItem({ critChance: 50 }, [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 60 }]);
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }), [ie]);
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 1.75));
    });

    it("`onHitMagicDamage` パッシブあり — onHitMagicPostMitigation が正しい値に一致する（MR ミティゲーション適用）", () => {
      const onHitItem = makeItem({}, [{ kind: "onHitMagicDamage", damage: 80 }]);
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }), [onHitItem]);
      const def = makeDefender(0, 60);
      const result = calculateDamage(atk, def);
      const expected = Math.round(mitigate(80, 60));
      expect(result.autoAttack.onHitMagicPostMitigation).toBe(expected);
    });

    it("`onHitMagicDamageScaled` パッシブあり — base + apRatio * ap が計算されてミティゲーション適用される", () => {
      // AP = 100 (no apAmp), damage = 15 + 0.15 * 100 = 30, MR=0
      const nashor = makeItem({ ap: 100 }, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }), [nashor]);
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      const preMit = 15 + 0.15 * 100;
      expect(result.autoAttack.onHitMagicPostMitigation).toBe(Math.round(preMit));
    });

    it("`onHitMagicDamage` なし — onHitMagicPostMitigation / onHitMagicHpPercent が null", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender();
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.onHitMagicPostMitigation).toBeNull();
      expect(result.autoAttack.onHitMagicHpPercent).toBeNull();
    });

    it("`nthHitPhysical` パッシブあり — レベル1 で minDamage が使用される", () => {
      // Lv1: minDamage + (maxDamage - minDamage) * 0/17 = 150
      const kraken = makeItem({}, [{ kind: "nthHitPhysical", hitCount: 3, minDamage: 150, maxDamage: 210 }]);
      const atk: Champion = {
        species: makeSpecies([], 30, 30, BASE_HP),
        level: 1,
        items: [kraken],
        skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }),
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(150);
    });

    it("`nthHitPhysical` パッシブあり — レベル18 で maxDamage が使用される", () => {
      const kraken = makeItem({}, [{ kind: "nthHitPhysical", hitCount: 3, minDamage: 150, maxDamage: 210 }]);
      const atk: Champion = {
        species: makeSpecies([], 30, 30, BASE_HP),
        level: 18,
        items: [kraken],
        skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }),
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(210);
    });

    it("`onHitPhysicalCurrentHpPercent` パッシブあり — defStats.hp * percent/100 がダメージになる", () => {
      // percent=9, defHp=600 → preMit = 0.09 * 600 = 54, armor=0
      const botrk = makeItem({}, [{ kind: "onHitPhysicalCurrentHpPercent", percent: 9 }]);
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }), [botrk]);
      const def = makeDefender(0, 0, BASE_HP);
      const result = calculateDamage(atk, def);
      const expected = Math.round(0.09 * BASE_HP);
      expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(expected);
    });

    it("`spellblade` パッシブあり — baseAdRatio * atkStats.baseAd がダメージになる", () => {
      // baseAd=BASE_AD=50, ratio=2.0 → 100, armor=0
      const trinity = makeItem({}, [{ kind: "spellblade", baseAdRatio: 2.0 }]);
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }), [trinity]);
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(Math.round(2.0 * BASE_AD));
    });

    it("on-hit physical なし — onHitPhysicalPostMitigation / onHitPhysicalHpPercent が null", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender();
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.onHitPhysicalPostMitigation).toBeNull();
      expect(result.autoAttack.onHitPhysicalHpPercent).toBeNull();
    });

    it("defender.hp=0 — hpPercent = 0（ゼロ除算防止）", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def: Champion = {
        species: makeSpecies([], 0, 0, 0),
        level: 1,
        items: [],
        skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
      };
      const result = calculateDamage(atk, def);
      expect(result.autoAttack.hpPercent).toBe(0);
    });
  });

  // ── 3-d: calculateSkills ─────────────────────────────────────────

  describe("3-d: calculateSkills", () => {
    it("rank=0 のスキル — preMitigation/postMitigation/hpPercent がすべて 0 で返る", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "physical", 100)],
        alloc({ q: 0, w: 0, e: 0, r: 0 })
      );
      const def = makeDefender();
      const result = calculateDamage(atk, def);
      const q = result.skills[0];
      expect(q.preMitigation).toBe(0);
      expect(q.postMitigation).toBe(0);
      expect(q.hpPercent).toBe(0);
    });

    it("physical ダメージ — effectiveResistance が armor ベースで計算される", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "physical", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 })
      );
      const def = makeDefender(60, 30);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].effectiveResistance).toBe(60);
    });

    it("magic ダメージ — effectiveResistance が magicResist ベースで計算される", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "magic", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 })
      );
      const def = makeDefender(30, 60);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].effectiveResistance).toBe(60);
    });

    it("true ダメージ — effectiveResistance=0、postMitigation=preMitigation に一致する", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "true", 150)],
        alloc({ q: 1, w: 0, e: 0, r: 0 })
      );
      const def = makeDefender(100, 100);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].effectiveResistance).toBe(0);
      expect(result.skills[0].postMitigation).toBe(150);
    });

    it("preMitigation=0（フォーミュラ評価が 0）— そのスキルが結果配列から除外される", () => {
      // rank=1 but formula evaluates to 0
      const atk = makeAttacker(
        [makeSkill("Q", "physical", 0)],
        alloc({ q: 1, w: 0, e: 0, r: 0 })
      );
      const def = makeDefender();
      const result = calculateDamage(atk, def);
      // formula value=0, rank=1 → excluded
      expect(result.skills).toHaveLength(0);
    });

    it("variants あり（formula 指定）— variant ごとに独立した formula が評価される", () => {
      const spec: SkillDamageSpec = {
        slot: "Q",
        name: "Q with variant",
        damageType: "physical",
        damageFormula: { kind: "const", value: 100 },
        variants: [
          {
            name: "Variant A",
            formula: { kind: "const", value: 200 },
          },
        ],
      };
      const atk = makeAttacker([spec], alloc({ q: 1, w: 0, e: 0, r: 0 }));
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].variants).toHaveLength(1);
      expect(result.skills[0].variants![0].preMitigation).toBe(200);
    });

    it("variants あり（multiplier 指定）— variant.preMitigation = basePreMitigation * multiplier に一致する", () => {
      const spec: SkillDamageSpec = {
        slot: "Q",
        name: "Q with multiplier variant",
        damageType: "physical",
        damageFormula: { kind: "const", value: 100 },
        variants: [
          {
            name: "Sweet Spot",
            multiplier: 1.7,
          },
        ],
      };
      const atk = makeAttacker([spec], alloc({ q: 1, w: 0, e: 0, r: 0 }));
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].variants![0].preMitigation).toBe(Math.round(100 * 1.7));
    });

    it("variants あり（damageType 上書き）— 異なる damageType で resistance が計算される", () => {
      // base is physical, variant is magic
      const spec: SkillDamageSpec = {
        slot: "Q",
        name: "Q mixed type",
        damageType: "physical",
        damageFormula: { kind: "const", value: 100 },
        variants: [
          {
            name: "Magic Variant",
            formula: { kind: "const", value: 100 },
            damageType: "magic",
          },
        ],
      };
      const atk = makeAttacker([spec], alloc({ q: 1, w: 0, e: 0, r: 0 }));
      // armor=60, mr=80
      const def = makeDefender(60, 80);
      const result = calculateDamage(atk, def);
      // base: physical → effectiveResistance=60
      expect(result.skills[0].effectiveResistance).toBe(60);
      // variant: magic → effectiveResistance=80
      expect(result.skills[0].variants![0].effectiveResistance).toBe(80);
    });

    it("variants なし — variants フィールドが結果オブジェクトに存在しない", () => {
      const atk = makeAttacker(
        [makeSkill("Q", "physical", 100)],
        alloc({ q: 1, w: 0, e: 0, r: 0 })
      );
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.skills[0].variants).toBeUndefined();
    });
  });

  // ── 3-e: calculateChampionPassiveAA ──────────────────────────────

  describe("3-e: calculateChampionPassiveAA", () => {
    it("passiveSpec なし — undefined が返る", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender();
      const result = calculateDamage(atk, def);
      expect(result.championPassiveAA).toBeUndefined();
    });

    it("`onHitDamage` physical — effRes が effectiveArmor に一致する", () => {
      const species: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        passiveSpec: {
          kind: "onHitDamage",
          formula: { kind: "const", value: 50 },
          damageType: "physical",
        },
      });
      const atk: Champion = { species, level: 1, items: [], skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }) };
      const def = makeDefender(60, 0);
      const result = calculateDamage(atk, def);
      expect(result.championPassiveAA).toBeDefined();
      expect(result.championPassiveAA!.effectiveResistance).toBe(60);
    });

    it("`onHitDamage` magic — effRes が effectiveMagicResist に一致する", () => {
      const species: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        passiveSpec: {
          kind: "onHitDamage",
          formula: { kind: "const", value: 50 },
          damageType: "magic",
        },
      });
      const atk: Champion = { species, level: 1, items: [], skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }) };
      const def = makeDefender(0, 60);
      const result = calculateDamage(atk, def);
      expect(result.championPassiveAA!.effectiveResistance).toBe(60);
    });

    it("`onHitDamage` true — effectiveResistance=0, postMitigation=preMitigation", () => {
      const species: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        passiveSpec: {
          kind: "onHitDamage",
          formula: { kind: "const", value: 75 },
          damageType: "true",
        },
      });
      const atk: Champion = { species, level: 1, items: [], skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }) };
      const def = makeDefender(100, 100);
      const result = calculateDamage(atk, def);
      expect(result.championPassiveAA!.effectiveResistance).toBe(0);
      expect(result.championPassiveAA!.postMitigation).toBe(75);
    });

    it("preMit=0 — postMitigation=0, reductionPercent=0", () => {
      const species: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        passiveSpec: {
          kind: "onHitDamage",
          formula: { kind: "const", value: 0 },
          damageType: "physical",
        },
      });
      const atk: Champion = { species, level: 1, items: [], skillAllocation: alloc({ q: 0, w: 0, e: 0, r: 0 }) };
      const def = makeDefender(60, 0);
      const result = calculateDamage(atk, def);
      expect(result.championPassiveAA!.postMitigation).toBe(0);
      expect(result.championPassiveAA!.reductionPercent).toBe(0);
    });
  });

  // ── 3-f: applyStateModifier ──────────────────────────────────────

  describe("3-f: applyStateModifier", () => {
    it("`attacker.bonusAd` 修飾 — bonusAd と totalAd が delta 分加算される", () => {
      // stateModifier adds 0.20 * baseAd to bonusAd
      // baseAd=50, delta=50*0.20=10, baseAA preMit=50, state AA preMit=60
      const stateSpecies: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        stateModifiers: [
          {
            name: "State",
            triggerSlot: "Q",
            statModifiers: [
              {
                stat: "attacker.bonusAd",
                addFormula: {
                  kind: "mul",
                  operands: [
                    { kind: "stat", ref: "attacker.baseAd" },
                    { kind: "const", value: 0.20 },
                  ],
                },
              },
            ],
          },
        ],
      });
      const atk: Champion = {
        species: stateSpecies,
        level: 1,
        items: [],
        skillAllocation: alloc({ q: 1, w: 0, e: 0, r: 0 }),
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      const stateAA = result.stateResults![0].autoAttack;
      // base totalAd=50, delta=10 → state totalAd=60
      expect(stateAA.preMitigation).toBe(60);
    });

    it("delta=0 — 加算後も元の値と同じ", () => {
      const stateSpecies: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        stateModifiers: [
          {
            name: "ZeroDelta",
            triggerSlot: "Q",
            statModifiers: [
              {
                stat: "attacker.bonusAd",
                addFormula: { kind: "const", value: 0 },
              },
            ],
          },
        ],
      });
      const atk: Champion = {
        species: stateSpecies,
        level: 1,
        items: [],
        skillAllocation: alloc({ q: 1, w: 0, e: 0, r: 0 }),
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      const baseAA = result.autoAttack.preMitigation;
      const stateAA = result.stateResults![0].autoAttack.preMitigation;
      expect(stateAA).toBe(baseAA);
    });
  });

  // ── 3-g: calculateDamage（統合）────────────────────────────────

  describe("3-g: calculateDamage（統合）", () => {
    it("stateModifiers なし — stateResults フィールドが結果に存在しない", () => {
      const atk = makeAttacker([], alloc({ q: 0, w: 0, e: 0, r: 0 }));
      const def = makeDefender();
      const result = calculateDamage(atk, def);
      expect(result.stateResults).toBeUndefined();
    });

    it("stateModifier の triggerSlot が rank=0 のとき — そのモディファイアはスキップされる", () => {
      const stateSpecies: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        stateModifiers: [
          {
            name: "R State",
            triggerSlot: "R",
            statModifiers: [
              {
                stat: "attacker.bonusAd",
                addFormula: { kind: "const", value: 10 },
              },
            ],
          },
        ],
      });
      const atk: Champion = {
        species: stateSpecies,
        level: 1,
        items: [],
        // R rank=0 → skipped
        skillAllocation: { q: 1, w: 0, e: 0, r: 0 },
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.stateResults).toBeUndefined();
    });

    it("stateModifier の triggerSlot が rank>0 のとき — stateResults に追加される", () => {
      const stateSpecies: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        stateModifiers: [
          {
            name: "Q State",
            triggerSlot: "Q",
            statModifiers: [
              {
                stat: "attacker.bonusAd",
                addFormula: { kind: "const", value: 10 },
              },
            ],
          },
        ],
      });
      const atk: Champion = {
        species: stateSpecies,
        level: 1,
        items: [],
        skillAllocation: { q: 1, w: 0, e: 0, r: 0 },
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.stateResults).toHaveLength(1);
      expect(result.stateResults![0].stateName).toBe("Q State");
    });

    it("championPassiveAA あり — autoAttack と stateResults の両方に含まれる", () => {
      const stateSpecies: ChampionSpecies = makeSpecies([], 30, 30, BASE_HP, undefined, {
        passiveSpec: {
          kind: "onHitDamage",
          formula: { kind: "const", value: 50 },
          damageType: "physical",
        },
        stateModifiers: [
          {
            name: "Q State",
            triggerSlot: "Q",
            statModifiers: [
              {
                stat: "attacker.bonusAd",
                addFormula: { kind: "const", value: 10 },
              },
            ],
          },
        ],
      });
      const atk: Champion = {
        species: stateSpecies,
        level: 1,
        items: [],
        skillAllocation: { q: 1, w: 0, e: 0, r: 0 },
      };
      const def = makeDefender(0, 0);
      const result = calculateDamage(atk, def);
      expect(result.championPassiveAA).toBeDefined();
      expect(result.stateResults![0].championPassiveAA).toBeDefined();
    });
  });
});
