import { describe, it, expect } from "vitest";
import { calculateDamage } from "@/contexts/games/lol/damage-calc/domain/services/damage-calculator";
import type {
  Champion,
  ChampionSpecies,
  Item,
} from "@/contexts/games/lol/damage-calc/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

const BASE_AD = 60;
const BASE_HP = 600;

function makeSpecies(ad = BASE_AD): ChampionSpecies {
  return {
    id: "TestChamp",
    name: "テスト",
    nameEn: "Test",
    baseStats: { hp: BASE_HP, ad, armor: 0, magicResist: 0, attackSpeed: 0.625, moveSpeed: 325 },
    statGrowth: { hp: 0, ad: 0, armor: 0, magicResist: 0 },
    skills: [],
  };
}

function makeDefender(armor = 0, hp = BASE_HP): Champion {
  return {
    species: {
      id: "Defender",
      name: "防御側",
      nameEn: "Defender",
      baseStats: { hp, ad: 50, armor, magicResist: 0, attackSpeed: 0.625, moveSpeed: 325 },
      statGrowth: { hp: 0, ad: 0, armor: 0, magicResist: 0 },
      skills: [],
    },
    level: 1,
    items: [],
    skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
  };
}

function makeAttacker(item: Item, level = 1, ad = BASE_AD): Champion {
  return {
    species: makeSpecies(ad),
    level,
    items: [item],
    skillAllocation: { q: 0, w: 0, e: 0, r: 0 },
  };
}

function makeEmptyItem(id: number, name: string): Omit<Item, "passives"> {
  return {
    id,
    name,
    nameEn: name,
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
    },
  };
}

function mitigate(pre: number, resistance: number): number {
  return pre * (100 / (100 + resistance));
}

// ── nthHitPhysical（ゲイルフォース 6672）────────────────────────────

describe("onHitPhysical: nthHitPhysical（ゲイルフォース 6672）", () => {
  const galeforce: Item = {
    ...makeEmptyItem(6672, "ゲイルフォース"),
    passives: [{ kind: "nthHitPhysical", hitCount: 3, minDamage: 150, maxDamage: 210 }],
  };

  it("level 1 → onHitPhysicalPostMitigation = minDamage（150）（armor=0）", () => {
    const atk = makeAttacker(galeforce, 1);
    const def = makeDefender(0);
    const result = calculateDamage(atk, def);
    // preMit = 150 + (210 - 150) * (1-1)/17 = 150
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(150);
  });

  it("level 18 → onHitPhysicalPostMitigation = maxDamage（210）（armor=0）", () => {
    const atk = makeAttacker(galeforce, 18);
    const def = makeDefender(0);
    const result = calculateDamage(atk, def);
    // preMit = 150 + (210 - 150) * (18-1)/17 = 210
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(210);
  });

  it("level 9（中間）→ 線形補間した値（armor=0）", () => {
    const atk = makeAttacker(galeforce, 9);
    const def = makeDefender(0);
    const result = calculateDamage(atk, def);
    const expected = Math.round(150 + (210 - 150) * (9 - 1) / 17);
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(expected);
  });

  it("level 1、armor=60 → ミティゲーション後の値が onHitPhysicalPostMitigation に入る", () => {
    const atk = makeAttacker(galeforce, 1);
    const def = makeDefender(60);
    const result = calculateDamage(atk, def);
    // preMit = 150（level 1）、effectiveArmor = 60（lethality/penPercent=0）
    const expected = Math.round(mitigate(150, 60));
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(expected);
  });

  it("level 18、armor=100 → ミティゲーション後の値が onHitPhysicalPostMitigation に入る", () => {
    const atk = makeAttacker(galeforce, 18);
    const def = makeDefender(100);
    const result = calculateDamage(atk, def);
    const expected = Math.round(mitigate(210, 100));
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(expected);
  });
});

// ── onHitPhysicalCurrentHpPercent（Blade of the Ruined King 3153）──

describe("onHitPhysical: onHitPhysicalCurrentHpPercent（BotRK 3153）", () => {
  const botrk: Item = {
    ...makeEmptyItem(3153, "Blade of the Ruined King"),
    passives: [{ kind: "onHitPhysicalCurrentHpPercent", percent: 9 }],
  };

  it("防御側HP 1000 → preMit = 90、armor=0 なら onHitPhysicalPostMitigation = 90", () => {
    const atk = makeAttacker(botrk, 1);
    const def = makeDefender(0, 1000);
    const result = calculateDamage(atk, def);
    // preMit = 0.09 * 1000 = 90
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(90);
  });

  it("防御側HP 2000 → preMit = 180、armor=0 なら onHitPhysicalPostMitigation = 180", () => {
    const atk = makeAttacker(botrk, 1);
    const def = makeDefender(0, 2000);
    const result = calculateDamage(atk, def);
    // preMit = 0.09 * 2000 = 180
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(180);
  });

  it("防御側HP 1000、armor=60 → ミティゲーション後の値が onHitPhysicalPostMitigation に入る", () => {
    const atk = makeAttacker(botrk, 1);
    const def = makeDefender(60, 1000);
    const result = calculateDamage(atk, def);
    const expected = Math.round(mitigate(90, 60));
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(expected);
  });

  it("onHitPhysicalHpPercent が非 null（defender.hp > 0）", () => {
    const atk = makeAttacker(botrk, 1);
    const def = makeDefender(0, 1000);
    const result = calculateDamage(atk, def);
    expect(result.autoAttack.onHitPhysicalHpPercent).not.toBeNull();
  });
});

// ── spellblade（Trinity Force 3078）────────────────────────────────

describe("onHitPhysical: spellblade（Trinity Force 3078）", () => {
  it("baseAdRatio=2.0、attacker baseAd=60 → onHitPhysicalPostMitigation = 120（armor=0）", () => {
    const trinity: Item = {
      ...makeEmptyItem(3078, "Trinity Force"),
      passives: [{ kind: "spellblade", baseAdRatio: 2.0 }],
    };
    const atk = makeAttacker(trinity, 1, 60);
    const def = makeDefender(0);
    const result = calculateDamage(atk, def);
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(Math.round(2.0 * 60));
  });

  it("baseAd が異なる（baseAd=80）→ onHitPhysicalPostMitigation が連動して変わる", () => {
    const trinity: Item = {
      ...makeEmptyItem(3078, "Trinity Force"),
      passives: [{ kind: "spellblade", baseAdRatio: 2.0 }],
    };
    const atk = makeAttacker(trinity, 1, 80);
    const def = makeDefender(0);
    const result = calculateDamage(atk, def);
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(Math.round(2.0 * 80));
  });

  it("armor=60 → ミティゲーション後の値が onHitPhysicalPostMitigation に入る", () => {
    const trinity: Item = {
      ...makeEmptyItem(3078, "Trinity Force"),
      passives: [{ kind: "spellblade", baseAdRatio: 2.0 }],
    };
    const atk = makeAttacker(trinity, 1, 60);
    const def = makeDefender(60);
    const result = calculateDamage(atk, def);
    const expected = Math.round(mitigate(2.0 * 60, 60));
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(expected);
  });

  it("onHitPhysicalHpPercent が非 null（defender.hp > 0）", () => {
    const trinity: Item = {
      ...makeEmptyItem(3078, "Trinity Force"),
      passives: [{ kind: "spellblade", baseAdRatio: 2.0 }],
    };
    const atk = makeAttacker(trinity, 1, 60);
    const def = makeDefender(0, 1000);
    const result = calculateDamage(atk, def);
    expect(result.autoAttack.onHitPhysicalHpPercent).not.toBeNull();
  });
});
