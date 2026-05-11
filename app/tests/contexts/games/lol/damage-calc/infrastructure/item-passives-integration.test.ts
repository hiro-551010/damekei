import { describe, it, expect } from "vitest";
import { itemRepository } from "@/contexts/games/lol/damage-calc/infrastructure/item-repository";
import { championRepository } from "@/contexts/games/lol/damage-calc/infrastructure/champion-repository";
import { createUseCases } from "@/contexts/games/lol/damage-calc/application/use-cases";

const useCases = createUseCases(championRepository, itemRepository);

const baseAttacker = {
  championId: "Aatrox",
  level: 1,
  itemIds: [] as number[],
  skillAllocation: { q: 1, w: 0, e: 0, r: 0 },
};

const baseDefender = {
  championId: "Aatrox",
  level: 1,
  itemIds: [] as number[],
};

// Aatrox level 1: hp=650, ad=60, armor=38, magicResist=32

describe("Wit's End (3091) — onHitMagicDamage", () => {
  const WITS_END_ID = 3091;

  it("findById(3091) で passive { kind: 'onHitMagicDamage', damage: 45 } が存在すること", async () => {
    const item = await itemRepository.findById(WITS_END_ID);
    expect(item).not.toBeNull();
    const passive = item!.passives.find((p) => p.kind === "onHitMagicDamage");
    expect(passive).toBeDefined();
    expect(passive).toEqual({ kind: "onHitMagicDamage", damage: 45 });
  });

  it("装備時に onHitMagicPreMitigation が 45 であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [WITS_END_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitMagicPreMitigation).toBe(45);
  });

  it("装備時に onHitMagicEffectiveResistance が 32 (Aatrox MR, magic pen なし) であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [WITS_END_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitMagicEffectiveResistance).toBe(32);
  });

  it("装備時に onHitMagicPostMitigation が Math.round(45 * 100/132) = 34 であること", async () => {
    // effMR = 32, postMit = Math.round(45 * 100/(100+32)) = Math.round(34.09) = 34
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [WITS_END_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(34);
  });

  it("未装備時に onHitMagicPreMitigation が null であること", async () => {
    const result = await useCases.calculateDamage(baseAttacker, baseDefender);
    expect(result.autoAttack.onHitMagicPreMitigation).toBeNull();
  });
});

describe("Nashor's Tooth (3115) — onHitMagicDamageScaled", () => {
  const NASHORS_ID = 3115;
  // Nashor's Tooth stats: ap=80
  // atkStats.ap = 0 (base) + 80 (item) = 80
  // onHitPreMitigation = 15 + 0.15 * 80 = 27

  it("findById(3115) で passive { kind: 'onHitMagicDamageScaled', ... } が存在すること", async () => {
    const item = await itemRepository.findById(NASHORS_ID);
    expect(item).not.toBeNull();
    const passive = item!.passives.find((p) => p.kind === "onHitMagicDamageScaled");
    expect(passive).toBeDefined();
    expect(passive).toEqual({ kind: "onHitMagicDamageScaled", base: 15, apRatio: 0.15 });
  });

  it("装備時に onHitMagicPreMitigation が 27 であること", async () => {
    // 15 + 0.15 * 80 = 27
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [NASHORS_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitMagicPreMitigation).toBe(27);
  });

  it("装備時に onHitMagicEffectiveResistance が 32 であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [NASHORS_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitMagicEffectiveResistance).toBe(32);
  });

  it("装備時に onHitMagicPostMitigation が Math.round(27 * 100/132) = 20 であること", async () => {
    // Math.round(27 * 100/132) = Math.round(20.45) = 20
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [NASHORS_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitMagicPostMitigation).toBe(20);
  });

  it("未装備時に onHitMagicPreMitigation が null であること", async () => {
    const result = await useCases.calculateDamage(baseAttacker, baseDefender);
    expect(result.autoAttack.onHitMagicPreMitigation).toBeNull();
  });
});

describe("Blade of the Ruined King (3153) — onHitPhysicalCurrentHpPercent", () => {
  const BOTRK_ID = 3153;
  // defStats.hp = 650 (Aatrox level 1)
  // onHitPhysicalPreMitigation = 0.09 * 650 = 58.5
  // effArmor = 38
  // onHitPhysicalPostMitigation = Math.round(58.5 * 100/138) = 42

  it("findById(3153) で passive { kind: 'onHitPhysicalCurrentHpPercent', percent: 9 } が存在すること", async () => {
    const item = await itemRepository.findById(BOTRK_ID);
    expect(item).not.toBeNull();
    const passive = item!.passives.find((p) => p.kind === "onHitPhysicalCurrentHpPercent");
    expect(passive).toBeDefined();
    expect(passive).toEqual({ kind: "onHitPhysicalCurrentHpPercent", percent: 9 });
  });

  it("装備時に onHitPhysicalPreMitigation が 58.5 であること", async () => {
    // (9 / 100) * 650 = 58.5
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [BOTRK_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalPreMitigation).toBeCloseTo(58.5, 1);
  });

  it("装備時に onHitPhysicalEffectiveResistance が 38 であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [BOTRK_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalEffectiveResistance).toBe(38);
  });

  it("装備時に onHitPhysicalPostMitigation が Math.round(58.5 * 100/138) = 42 であること", async () => {
    // Math.round(58.5 * 100/138) = Math.round(42.39) = 42
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [BOTRK_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(42);
  });

  it("未装備時に onHitPhysicalPreMitigation が null であること", async () => {
    const result = await useCases.calculateDamage(baseAttacker, baseDefender);
    expect(result.autoAttack.onHitPhysicalPreMitigation).toBeNull();
  });
});

describe("Trinity Force (3078) — spellblade", () => {
  const TRINITY_ID = 3078;
  // Trinity Force stats: ad=36
  // atkStats.baseAd = 60 (champion base AD, item AD goes to bonusAd)
  // onHitPhysicalPreMitigation = 2.0 * 60 = 120
  // effArmor = 38
  // onHitPhysicalPostMitigation = Math.round(120 * 100/138) = 87

  it("findById(3078) で passive { kind: 'spellblade', baseAdRatio: 2.0 } が存在すること", async () => {
    const item = await itemRepository.findById(TRINITY_ID);
    expect(item).not.toBeNull();
    const passive = item!.passives.find((p) => p.kind === "spellblade");
    expect(passive).toBeDefined();
    expect(passive).toEqual({ kind: "spellblade", baseAdRatio: 2.0 });
  });

  it("装備時に onHitPhysicalPreMitigation が 120 であること", async () => {
    // baseAdRatio * atkStats.baseAd = 2.0 * 60 = 120
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [TRINITY_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalPreMitigation).toBe(120);
  });

  it("装備時に onHitPhysicalEffectiveResistance が 38 であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [TRINITY_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalEffectiveResistance).toBe(38);
  });

  it("装備時に onHitPhysicalPostMitigation が Math.round(120 * 100/138) = 87 であること", async () => {
    // Math.round(120 * 100/138) = Math.round(86.96) = 87
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [TRINITY_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(87);
  });

  it("未装備時に onHitPhysicalPreMitigation が null であること", async () => {
    const result = await useCases.calculateDamage(baseAttacker, baseDefender);
    expect(result.autoAttack.onHitPhysicalPreMitigation).toBeNull();
  });
});

describe("Kraken Slayer (6672) — nthHitPhysical", () => {
  const KRAKEN_ID = 6672;
  // minDamage=150, maxDamage=210
  // level 1: 150 + (210-150) * (1-1)/17 = 150
  // level 18: 150 + (210-150) * (18-1)/17 = 210
  // effArmor level 1 = 38
  // effArmor level 18 = 38 + 4.8*17 = 119.6
  // level 1 post = Math.round(150 * 100/138) = 109
  // level 18 post = Math.round(210 * 100/219.6) = 96

  it("findById(6672) で passive { kind: 'nthHitPhysical', ... } が存在すること", async () => {
    const item = await itemRepository.findById(KRAKEN_ID);
    expect(item).not.toBeNull();
    const passive = item!.passives.find((p) => p.kind === "nthHitPhysical");
    expect(passive).toBeDefined();
    expect(passive).toEqual({ kind: "nthHitPhysical", hitCount: 3, minDamage: 150, maxDamage: 210 });
  });

  it("level 1 装備時に onHitPhysicalPreMitigation が 150 であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [KRAKEN_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalPreMitigation).toBe(150);
  });

  it("level 1 装備時に onHitPhysicalPostMitigation が Math.round(150 * 100/138) = 109 であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [KRAKEN_ID] },
      baseDefender,
    );
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(109);
  });

  it("level 18 装備時に onHitPhysicalPreMitigation が 210 であること", async () => {
    const result = await useCases.calculateDamage(
      { ...baseAttacker, level: 18, itemIds: [KRAKEN_ID] },
      { ...baseDefender, level: 18 },
    );
    expect(result.autoAttack.onHitPhysicalPreMitigation).toBe(210);
  });

  it("level 18 装備時に onHitPhysicalPostMitigation が Math.round(210 * 100/219.6) = 96 であること", async () => {
    // effArmor level 18 Aatrox = 38 + 4.8*17 = 119.6
    // Math.round(210 * 100/(100+119.6)) = Math.round(210 * 100/219.6) = Math.round(95.63) = 96
    const result = await useCases.calculateDamage(
      { ...baseAttacker, level: 18, itemIds: [KRAKEN_ID] },
      { ...baseDefender, level: 18 },
    );
    expect(result.autoAttack.onHitPhysicalPostMitigation).toBe(96);
  });

  it("未装備時に onHitPhysicalPreMitigation が null であること", async () => {
    const result = await useCases.calculateDamage(baseAttacker, baseDefender);
    expect(result.autoAttack.onHitPhysicalPreMitigation).toBeNull();
  });
});

describe("Rabadon's Deathcap (3089) — apAmp", () => {
  const RABADON_ID = 3089;
  // apAmp は AP を1.30倍に増幅する (ratio=0.30)
  // Ahri level 1 base AP = 0
  // With Rabadon: ap = 130, apAmp 1.30 -> atkStats.ap = 130 * 1.30 = 169
  // Ahri W (Fox-Fire, magic): 64 + 0.64 * ap at rank 1
  //   without: 64 + 0.64*0 = 64
  //   with: 64 + 0.64*169 = 172.16 -> Math.round = 172

  it("findById(3089) で passive { kind: 'apAmp', ratio: 0.30 } が存在すること", async () => {
    const item = await itemRepository.findById(RABADON_ID);
    expect(item).not.toBeNull();
    const passive = item!.passives.find((p) => p.kind === "apAmp");
    expect(passive).toBeDefined();
    expect(passive).toEqual({ kind: "apAmp", ratio: 0.3 });
  });

  it("Ahri + Rabadon のスキル W preMitigation が Ahri のみより大きいこと", async () => {
    const ahriAttacker = {
      championId: "Ahri",
      level: 1,
      itemIds: [] as number[],
      skillAllocation: { q: 0, w: 1, e: 0, r: 0 },
    };
    const ahriDefender = {
      championId: "Aatrox",
      level: 1,
      itemIds: [] as number[],
    };

    const resultWithout = await useCases.calculateDamage(ahriAttacker, ahriDefender);
    const resultWith = await useCases.calculateDamage(
      { ...ahriAttacker, itemIds: [RABADON_ID] },
      ahriDefender,
    );

    // W (Fox-Fire) is at index 1 in skills array (Q=0, W=1, E=2, R=3)
    const wWithout = resultWithout.skills.find((s) => s.slot === "W");
    const wWith = resultWith.skills.find((s) => s.slot === "W");

    expect(wWithout).toBeDefined();
    expect(wWith).toBeDefined();
    expect(wWith!.preMitigation).toBeGreaterThan(wWithout!.preMitigation);
  });
});

describe("Infinity Edge (3031) — critDamageAmp", () => {
  const IE_ID = 3031;
  const PHANTOM_DANCER_ID = 3046;
  // IE: ad=75, critChance=25, passive: critDamageAmp bonusFactor=0.35 minCritChance=40
  // PD: critChance=25, no ad
  // IE alone: critChance=25 < 40 -> critDamageAmp inactive
  // IE + PD: critChance=50 >= 40 -> critDamageAmp active, critMultiplier = 1.75 + 0.35 = 2.10

  it("findById(3031) で passive { kind: 'critDamageAmp', bonusFactor: 0.35, minCritChance: 40 } が存在すること", async () => {
    const item = await itemRepository.findById(IE_ID);
    expect(item).not.toBeNull();
    const passive = item!.passives.find((p) => p.kind === "critDamageAmp");
    expect(passive).toBeDefined();
    expect(passive).toEqual({ kind: "critDamageAmp", bonusFactor: 0.35, minCritChance: 40 });
  });

  it("IE 単体（critChance=25 < 40）の critPostMitigation は通常 crit ダメージ（1.75×）と同じであること", async () => {
    // totalAd = 60 + 75 = 135, critMult = 1.75 (no amp)
    // critPreMit = 135 * 1.75 = 236.25
    // effArmor = 38
    // critPost = Math.round(236.25 * 100/138) = 171
    const result = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [IE_ID] },
      baseDefender,
    );
    expect(result.autoAttack.critPostMitigation).toBe(171);
  });

  it("IE + Phantom Dancer（critChance=50 >= 40）で critPostMitigation が IE 単体より大きくなること", async () => {
    const resultIEOnly = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [IE_ID] },
      baseDefender,
    );
    const resultIEAndPD = await useCases.calculateDamage(
      { ...baseAttacker, itemIds: [IE_ID, PHANTOM_DANCER_ID] },
      baseDefender,
    );

    expect(resultIEOnly.autoAttack.critPostMitigation).not.toBeNull();
    expect(resultIEAndPD.autoAttack.critPostMitigation).not.toBeNull();
    expect(resultIEAndPD.autoAttack.critPostMitigation!).toBeGreaterThan(
      resultIEOnly.autoAttack.critPostMitigation!,
    );
  });
});
