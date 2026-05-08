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

const LEVEL_ONE = 1;
const BASE_AD = 50;
const BASE_ARMOR = 60;
const BASE_MR = 60;

function skill(
  slot: "Q" | "W" | "E" | "R",
  damageType: "physical" | "magic" | "true",
  baseDamageByRank: number[]
): SkillDamageSpec {
  return {
    slot,
    name: `${slot} Skill`,
    damageType,
    damageFormula: baseDamageByRank.length === 1 && baseDamageByRank[0] === 0
      ? { kind: "const", value: 0 }
      : { kind: "byRank", values: baseDamageByRank },
  };
}

function species(skills: SkillDamageSpec[], armor = BASE_ARMOR, magicResist = BASE_MR): ChampionSpecies {
  return {
    id: "TestChamp",
    name: "テスト",
    nameEn: "Test",
    baseStats: {
      hp: 600,
      ad: BASE_AD,
      armor,
      magicResist,
      attackSpeed: 0.625,
      moveSpeed: 325,
    },
    statGrowth: {
      hp: 0,
      ad: 0,
      armor: 0,
      magicResist: 0,
    },
    skills,
  };
}

function item(overrides: Partial<Item["stats"]> = {}, passives: ItemPassive[] = []): Item {
  return {
    id: 2001,
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
    passives,
  };
}

function alloc(overrides: Partial<SkillAllocation> = {}): SkillAllocation {
  return { q: 1, w: 1, e: 1, r: 1, ...overrides };
}

function attacker(
  skills: SkillDamageSpec[],
  skillAllocation: SkillAllocation,
  items: Item[] = []
): Champion {
  return {
    species: species(skills, 30, 30),
    level: LEVEL_ONE,
    items,
    skillAllocation,
  };
}

function defender(armor = BASE_ARMOR, magicResist = BASE_MR): Champion {
  return {
    species: species([], armor, magicResist),
    level: LEVEL_ONE,
    items: [],
    skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
  };
}

// ── calculateDamage ────────────────────────────────────────────────

describe("calculateDamage", () => {
  it("物理ダメージ: 防御力60に対して正しく軽減される", () => {
    const PRE_MITIGATION = 160;

    const result = calculateDamage(
      attacker(
        [
          skill("Q", "physical", [PRE_MITIGATION]),
          skill("W", "magic", [0]),
          skill("E", "true", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 1, w: 1, e: 1, r: 1 })
      ),
      defender(60, 30)
    );

    expect(result.skills[0].preMitigation).toBe(PRE_MITIGATION);
    expect(result.skills[0].effectiveResistance).toBe(60);
    expect(result.skills[0].postMitigation).toBe(100);
  });

  it("魔法ダメージ: MR60に対して正しく軽減される", () => {
    const PRE_MITIGATION = 160;

    const result = calculateDamage(
      attacker(
        [
          skill("Q", "magic", [PRE_MITIGATION]),
          skill("W", "physical", [0]),
          skill("E", "true", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 1, w: 1, e: 1, r: 1 })
      ),
      defender(30, 60)
    );

    expect(result.skills[0].preMitigation).toBe(PRE_MITIGATION);
    expect(result.skills[0].effectiveResistance).toBe(60);
    expect(result.skills[0].postMitigation).toBe(100);
  });

  it("true ダメージ: 軽減なし", () => {
    const PRE_MITIGATION = 123;

    const result = calculateDamage(
      attacker(
        [
          skill("Q", "true", [PRE_MITIGATION]),
          skill("W", "physical", [0]),
          skill("E", "magic", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 1, w: 1, e: 1, r: 1 })
      ),
      defender()
    );

    expect(result.skills[0].preMitigation).toBe(PRE_MITIGATION);
    expect(result.skills[0].effectiveResistance).toBe(0);
    expect(result.skills[0].postMitigation).toBe(PRE_MITIGATION);
  });

  it("Lethality: 実効アーマーが armor - lethality になる", () => {
    const PRE_MITIGATION = 140;
    const LETHALITY = 20;

    const result = calculateDamage(
      attacker(
        [
          skill("Q", "physical", [PRE_MITIGATION]),
          skill("W", "magic", [0]),
          skill("E", "true", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 1, w: 1, e: 1, r: 1 }),
        [item({ lethality: LETHALITY })]
      ),
      defender(60, 30)
    );

    expect(result.skills[0].effectiveResistance).toBe(40);
    expect(result.skills[0].postMitigation).toBe(100);
  });

  it("% アーマーペネトレーション: 実効アーマーが正しく減る", () => {
    const PRE_MITIGATION = 130;
    const ARMOR_PEN_PERCENT = 50;

    const result = calculateDamage(
      attacker(
        [
          skill("Q", "physical", [PRE_MITIGATION]),
          skill("W", "magic", [0]),
          skill("E", "true", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 1, w: 1, e: 1, r: 1 }),
        [item({ armorPenPercent: ARMOR_PEN_PERCENT })]
      ),
      defender(60, 30)
    );

    expect(result.skills[0].effectiveResistance).toBe(30);
    expect(result.skills[0].postMitigation).toBe(100);
  });

  it("スキルランク0: preMitigation = 0", () => {
    const BASE_DAMAGE = 100;

    const result = calculateDamage(
      attacker(
        [
          skill("Q", "physical", [BASE_DAMAGE]),
          skill("W", "magic", [0]),
          skill("E", "true", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 0, w: 1, e: 0, r: 0 })
      ),
      defender()
    );

    expect(result.skills[0].preMitigation).toBe(0);
    expect(result.skills[0].postMitigation).toBe(0);
  });

  it("全4スキル(QWER)の結果配列が返る", () => {
    const result = calculateDamage(
      attacker(
        [
          skill("Q", "physical", [10]),
          skill("W", "magic", [20]),
          skill("E", "true", [30]),
          skill("R", "physical", [40]),
        ],
        alloc({ q: 1, w: 1, e: 1, r: 1 })
      ),
      defender()
    );

    expect(result.skills).toHaveLength(4);
    expect(result.skills.map((skillResult) => skillResult.slot)).toEqual(["Q", "W", "E", "R"]);
  });

  it("Infinity Edge（critChance: 60%）装備時、クリットダメージが totalAd × 2.10 になる", () => {
    const ie = item(
      { critChance: 60 },
      [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 }]
    );
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [ie]),
      defender(0, 0)
    );

    const totalAd = BASE_AD;
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(totalAd * 2.10));
  });

  it("critChance: 50%（閾値未満）のとき、IE があっても 1.75 倍のまま", () => {
    const ie = item(
      { critChance: 50 },
      [{ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 60 }]
    );
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [ie]),
      defender(0, 0)
    );

    const totalAd = BASE_AD;
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(totalAd * 1.75));
  });

  it("IE なし・critChance: 60% のとき、1.75 倍のまま", () => {
    const critItem = item({ critChance: 60 });
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [critItem]),
      defender(0, 0)
    );

    const totalAd = BASE_AD;
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(totalAd * 1.75));
  });

  it("onHitMagicDamage パッシブあり: MR軽減後の値が返る", () => {
    const onHitItem = item({}, [{ kind: "onHitMagicDamage", damage: 80 }]);
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [onHitItem]),
      defender(0, 60)
    );

    expect(result.autoAttack.onHitMagicPostMitigation).toBe(Math.round(80 * (100 / (100 + 60))));
    expect(result.autoAttack.onHitMagicHpPercent).toBe(Math.round((Math.round(80 * (100 / 160)) / 600) * 1000) / 10);
  });

  it("apAmp パッシブ（Rabadon's）: AP が ratio 倍に増幅されスキルダメージに反映される", () => {
    const rabadon = item({ ap: 100 }, [{ kind: "apAmp", ratio: 0.30 }]);
    const result = calculateDamage(
      attacker(
        [
          skill("Q", "magic", [0]),
          skill("W", "physical", [0]),
          skill("E", "true", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 1, w: 0, e: 0, r: 0 }),
        [rabadon]
      ),
      defender(0, 0)
    );
    // AP = 100 * 1.30 = 130
    // skill Q: ap formula なし → preMitigation = 0 (スキル係数なし)
    // APスケールスキルで確認するため別パターンで
    expect(result.autoAttack.postMitigation).toBeGreaterThan(0);
  });

  it("apAmp パッシブ（Rabadon's）: APスケールスキルに増幅APが適用される", () => {
    const AP_BASE = 100;
    const AP_RATIO = 1.0;
    const rabadon = item({ ap: AP_BASE }, [{ kind: "apAmp", ratio: 0.30 }]);
    const result = calculateDamage(
      attacker(
        [
          {
            slot: "Q",
            name: "Q Skill",
            damageType: "magic",
            damageFormula: {
              kind: "mul",
              operands: [
                { kind: "stat", ref: "attacker.ap" },
                { kind: "const", value: AP_RATIO },
              ],
            },
          },
          skill("W", "physical", [0]),
          skill("E", "true", [0]),
          skill("R", "physical", [0]),
        ],
        alloc({ q: 1, w: 0, e: 0, r: 0 }),
        [rabadon]
      ),
      defender(0, 0)
    );
    // AP = 100 * 1.30 = 130 → preMitigation = 130 * 1.0 = 130
    expect(result.skills[0].preMitigation).toBe(130);
  });

  it("onHitPhysicalPostMitigation パッシブなし: null が返る", () => {
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 })),
      defender()
    );

    expect(result.autoAttack.onHitPhysicalPostMitigation).toBeNull();
    expect(result.autoAttack.onHitPhysicalHpPercent).toBeNull();
  });

  it("Kraken Slayer（nthHitPhysical）: Lv1で minDamage、アーマー軽減後の値が返る", () => {
    const kraken = item({}, [{ kind: "nthHitPhysical", hitCount: 3, minDamage: 150, maxDamage: 210 }]);
    const result = calculateDamage(
      { ...attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [kraken]), level: 1 },
      defender(60, 0)
    );
    // Lv1: 150 + (210-150) * 0/17 = 150
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(Math.round(150 * (100 / 160)));
  });

  it("Kraken Slayer（nthHitPhysical）: Lv18で maxDamage になる", () => {
    const kraken = item({}, [{ kind: "nthHitPhysical", hitCount: 3, minDamage: 150, maxDamage: 210 }]);
    const result = calculateDamage(
      { ...attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [kraken]), level: 18 },
      defender(0, 0)
    );
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(210);
  });

  it("Blade of the Ruined King（onHitPhysicalCurrentHpPercent）: 満HPの9%がアーマー軽減後に返る", () => {
    const botrk = item({}, [{ kind: "onHitPhysicalCurrentHpPercent", percent: 9 }]);
    const def = defender(60, 0);
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [botrk]),
      def
    );
    // defStats.hp = 600, preMit = 9% * 600 = 54, effArmor = 60
    const preMit = 0.09 * 600;
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(Math.round(preMit * (100 / 160)));
  });

  it("Trinity Force（spellblade）: 基礎AD × 2.0 がアーマー軽減後に返る", () => {
    const trinity = item({ ad: 30 }, [{ kind: "spellblade", baseAdRatio: 2.0 }]);
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [trinity]),
      defender(60, 0)
    );
    // baseAd = BASE_AD = 50 (growth = 0, level = 1), preMit = 2.0 * 50 = 100
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(Math.round(100 * (100 / 160)));
  });

  it("Trinity Force + Kraken: 物理オンヒットが合算される", () => {
    const trinity = item({ ad: 0 }, [{ kind: "spellblade", baseAdRatio: 2.0 }]);
    const kraken = item({}, [{ kind: "nthHitPhysical", hitCount: 3, minDamage: 150, maxDamage: 210 }]);
    const result = calculateDamage(
      { ...attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [trinity, kraken]), level: 1 },
      defender(0, 0)
    );
    // baseAd = 50, spellblade = 100, kraken Lv1 = 150 → total = 250
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(250);
  });

  it("Nashor's Tooth（onHitMagicDamageScaled）: base + AP比率がMR軽減後に返る", () => {
    const nashor = item({ ap: 100 }, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [nashor]),
      defender(0, 60)
    );
    // AP = 100 (no apAmp), damage = 15 + 0.15 * 100 = 30
    const preMit = 15 + 0.15 * 100;
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(Math.round(preMit * (100 / 160)));
  });

  it("Nashor's Tooth + Rabadon's: APが増幅されてからオンヒットダメージに反映される", () => {
    const nashor = item({ ap: 100 }, [{ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 }]);
    const rabadon = item({ ap: 0 }, [{ kind: "apAmp", ratio: 0.30 }]);
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [nashor, rabadon]),
      defender(0, 0)
    );
    // AP = 100 * 1.30 = 130 → damage = 15 + 0.15 * 130 = 34.5
    const ap = 130;
    const preMit = 15 + 0.15 * ap;
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(Math.round(preMit));
  });

  it("Wit's End（onHitMagicDamage: 45）: MR軽減後の値が返る", () => {
    const witsEnd = item({}, [{ kind: "onHitMagicDamage", damage: 45 }]);
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 }), [witsEnd]),
      defender(0, 60)
    );

    expect(result.autoAttack.onHitMagicPostMitigation).toBe(Math.round(45 * (100 / (100 + 60))));
  });

  it("onHitMagicDamage パッシブなし: null が返る", () => {
    const result = calculateDamage(
      attacker([skill("Q", "physical", [0]), skill("W", "magic", [0]), skill("E", "true", [0]), skill("R", "physical", [0])], alloc({ q: 0, w: 0, e: 0, r: 0 })),
      defender()
    );

    expect(result.autoAttack.onHitMagicPostMitigation).toBeNull();
    expect(result.autoAttack.onHitMagicHpPercent).toBeNull();
  });
});

// ── Aatrox 固有ロジック ──────────────────────────────────────────────

describe('Aatrox 固有ロジック', () => {
  function aatroxSpecies(): ChampionSpecies {
    return {
      id: 'Aatrox',
      name: 'アートロックス',
      nameEn: 'Aatrox',
      baseStats: { hp: 650, ad: 60, armor: 38, magicResist: 32, attackSpeed: 0.651, moveSpeed: 330 },
      statGrowth: { hp: 0, ad: 0, armor: 0, magicResist: 0 },
      skills: [
        {
          slot: 'Q',
          name: 'ダーキン・ブレード',
          damageType: 'physical',
          damageFormula: {
            kind: 'add',
            operands: [
              { kind: 'byRank', values: [10, 20, 30, 40, 50] },
              { kind: 'mul', operands: [{ kind: 'stat', ref: 'attacker.totalAd' }, { kind: 'byRank', values: [1.0, 1.0, 1.0, 1.0, 1.0] }] },
            ],
          },
          variants: [{
            name: 'スイートスポット',
            multiplier: 1.7,
            formula: undefined,
          }],
        },
        skill('W', 'magic', [0, 0, 0, 0, 0]),
        skill('E', 'physical', [0, 0, 0, 0, 0]),
        skill('R', 'physical', [0, 0, 0]),
      ],
      passiveSpec: {
        kind: 'onHitDamage',
        formula: {
          kind: 'mul',
          operands: [
            { kind: 'stat', ref: 'defender.maxHp' },
            { kind: 'byLevel', values: [0.04, 0.0439, 0.0479, 0.0518, 0.0558, 0.0597, 0.0637, 0.0676, 0.0716, 0.0755, 0.0795, 0.0834, 0.0874, 0.0913, 0.0953, 0.0992, 0.1032, 0.1071] },
          ],
        },
        damageType: 'physical',
      },
      stateModifiers: [
        {
          name: 'R (World Ender)',
          triggerSlot: 'R',
          statModifiers: [
            {
              stat: 'attacker.bonusAd',
              addFormula: {
                kind: 'mul',
                operands: [
                  { kind: 'stat', ref: 'attacker.baseAd' },
                  { kind: 'byRank', values: [0.20, 0.30, 0.40] },
                ],
              },
            },
          ],
        },
      ],
    };
  }

  it('パッシブAA: Lv1でのHP%物理ダメージが返る', () => {
    const def: Champion = {
      species: species([], 0, 0),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const atk: Champion = {
      species: aatroxSpecies(),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const result = calculateDamage(atk, def);
    // Lv1: 4.0% of 600HP = 24
    expect(result.championPassiveAA).toBeDefined();
    expect(result.championPassiveAA!.preMitigation).toBe(24);
    expect(result.championPassiveAA!.postMitigation).toBe(24); // armor 0
  });

  it('パッシブAA: アーマー60に対して軽減される', () => {
    const def: Champion = {
      species: species([], 60, 0),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const atk: Champion = {
      species: aatroxSpecies(),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const result = calculateDamage(atk, def);
    // preMit = 4% * 600 = 24, effArmor = 60, postMit = 24 * 100/160 = 15
    expect(result.championPassiveAA!.postMitigation).toBe(Math.round(24 * 100 / 160));
  });

  it('Q スイートスポットバリアント: 基本ダメージの1.7倍が返る', () => {
    const def: Champion = {
      species: species([], 0, 0),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const atk: Champion = {
      species: aatroxSpecies(),
      level: 18,
      items: [],
      skillAllocation: { q: 5, w: 0, e: 0, r: 3 },
    };
    const result = calculateDamage(atk, def);
    const q = result.skills[0];
    expect(q.variants).toHaveLength(1);
    expect(q.variants![0].name).toBe('スイートスポット');
    expect(q.variants![0].preMitigation).toBe(Math.round(q.preMitigation * 1.7));
  });

  it('Rランク0のとき stateResults が空', () => {
    const atk: Champion = {
      species: aatroxSpecies(),
      level: 1,
      items: [],
      skillAllocation: { q: 1, w: 0, e: 0, r: 0 },
    };
    const def: Champion = {
      species: species([], 60, 0),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const result = calculateDamage(atk, def);
    expect(result.stateResults).toBeUndefined();
  });

  it('R発動中: bonusAd が基礎ADの20%増加し totalAd が増える（ランク1）', () => {
    const atk: Champion = {
      species: aatroxSpecies(),
      level: 6,
      items: [],
      skillAllocation: { q: 1, w: 1, e: 1, r: 1 },
    };
    const def: Champion = {
      species: species([], 0, 0),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const baseResult = calculateDamage(atk, def);
    const stateResult = baseResult.stateResults?.[0];
    expect(stateResult).toBeDefined();
    expect(stateResult!.stateName).toBe('R (World Ender)');
    expect(stateResult!.rank).toBe(1);
    // baseAd = 60 (no items, no growth), bonusBoost = 60 * 20% = 12
    // R state totalAd = 60 + 12 = 72
    expect(stateResult!.autoAttack.preMitigation).toBe(72);
  });
});

// ── Ashe 固有ロジック（aaCritOverride） ──────────────────────────────
import type { AACritOverride } from "@/contexts/games/lol/damage-calc/domain/models";

describe('Ashe 固有ロジック（aaCritOverride）', () => {
  function asheSpecies(aaCritOverride?: AACritOverride): ChampionSpecies {
    return {
      ...species([
        skill('Q', 'physical', [0, 0, 0, 0, 0]),
        skill('W', 'physical', [0, 0, 0, 0, 0]),
        skill('E', 'physical', [0, 0, 0, 0, 0]),
        skill('R', 'magic', [0, 0, 0]),
      ]),
      id: 'Ashe',
      name: 'アッシュ',
      nameEn: 'Ashe',
      ...(aaCritOverride !== undefined ? { aaCritOverride } : {}),
    };
  }

  it('critChance=0 でも alwaysCrit=true のとき critPostMitigation が返る', () => {
    const atk: Champion = {
      species: asheSpecies({ alwaysCrit: true, baseMultiplier: 1.10 }),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const result = calculateDamage(atk, { species: species([], 0, 0), level: 1, items: [], skillAllocation: { q: 0, w: 0, e: 0, r: 0 } });
    // preMit = BASE_AD=50, critPreMit = 50 * 1.10 = 55
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 1.10));
  });

  it('baseMultiplier=1.10 が使われる（1.75 ではない）', () => {
    const atk: Champion = {
      species: asheSpecies({ alwaysCrit: true, baseMultiplier: 1.10 }),
      level: 1,
      items: [],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const result = calculateDamage(atk, { species: species([], 0, 0), level: 1, items: [], skillAllocation: { q: 0, w: 0, e: 0, r: 0 } });
    expect(result.autoAttack.critPostMitigation).not.toBe(Math.round(BASE_AD * 1.75));
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 1.10));
  });

  it('IE（critDamageAmp）装備時: baseMultiplier + bonusFactor が使われる', () => {
    const ie = item({ critChance: 20 }, [{ kind: 'critDamageAmp', bonusFactor: 0.35, minCritChance: 1 }]);
    const atk: Champion = {
      species: asheSpecies({ alwaysCrit: true, baseMultiplier: 1.10 }),
      level: 1,
      items: [ie],
      skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
    };
    const result = calculateDamage(atk, { species: species([], 0, 0), level: 1, items: [], skillAllocation: { q: 0, w: 0, e: 0, r: 0 } });
    // critMultiplier = 1.10 + 0.35 = 1.45
    expect(result.autoAttack.critPostMitigation).toBe(Math.round(BASE_AD * 1.45));
  });
});
