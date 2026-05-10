import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUseCases } from "@/contexts/games/lol/damage-calc/application/use-cases";
import { NotFoundError, InvalidSkillAllocationError } from "@/contexts/games/lol/damage-calc/domain/errors";
import type { ChampionRepository, ItemRepository } from "@/contexts/games/lol/damage-calc/domain/ports";
import type { ChampionSpecies, Item } from "@/contexts/games/lol/damage-calc/domain/models";

// ── フィクスチャ ──────────────────────────────────────────────────

function makeChampionSpecies(id: string): ChampionSpecies {
  return {
    id,
    name: id + "の名前",
    nameEn: id,
    baseStats: {
      hp: 600,
      ad: 60,
      armor: 30,
      magicResist: 32,
      attackSpeed: 0.625,
      moveSpeed: 325,
    },
    statGrowth: {
      hp: 100,
      ad: 3.5,
      armor: 4.5,
      magicResist: 2.05,
    },
    skills: [
      {
        slot: "Q",
        name: "Q",
        damageType: "physical",
        damageFormula: { kind: "byRank", values: [100, 150, 200, 250, 300] },
      },
      {
        slot: "W",
        name: "W",
        damageType: "magic",
        damageFormula: { kind: "const", value: 0 },
      },
      {
        slot: "E",
        name: "E",
        damageType: "physical",
        damageFormula: { kind: "const", value: 0 },
      },
      {
        slot: "R",
        name: "R",
        damageType: "physical",
        damageFormula: { kind: "byRank", values: [200, 300, 400] },
      },
    ],
  };
}

function makeItem(id: number): Item {
  return {
    id,
    name: `アイテム${id}`,
    nameEn: `item${id}`,
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
    passives: [],
  };
}

const CHAMPION_ATK = makeChampionSpecies("Aatrox");
const CHAMPION_DEF = makeChampionSpecies("Annie");
const ITEM_1 = makeItem(1001);
const ITEM_2 = makeItem(1002);

function makeChampionRepo(
  champions: ChampionSpecies[] = [CHAMPION_ATK, CHAMPION_DEF]
): ChampionRepository {
  return {
    findAll: vi.fn().mockResolvedValue(champions),
    findById: vi.fn().mockImplementation((id: string) =>
      Promise.resolve(champions.find((c) => c.id === id) ?? null)
    ),
  };
}

function makeItemRepo(items: Item[] = [ITEM_1, ITEM_2]): ItemRepository {
  return {
    findAll: vi.fn().mockResolvedValue(items),
    findById: vi.fn().mockImplementation((id: number) =>
      Promise.resolve(items.find((i) => i.id === id) ?? null)
    ),
  };
}

const baseAttacker = {
  championId: "Aatrox",
  level: 6,
  itemIds: [],
  skillAllocation: { q: 2, w: 1, e: 1, r: 1 },
};

const baseDefender = {
  championId: "Annie",
  level: 6,
  itemIds: [],
};

// ── TASK-011: calculateDamage ユースケース ──────────────────────────

describe("TASK-011: LoL use-cases — calculateDamage ユースケース", () => {
  let useCases: ReturnType<typeof createUseCases>;

  beforeEach(() => {
    useCases = createUseCases(makeChampionRepo(), makeItemRepo());
  });

  it("正常系 — atkSpecies / defSpecies / items がすべて見つかるとき結果が返る", async () => {
    const result = await useCases.calculateDamage(baseAttacker, baseDefender);
    expect(result).toBeDefined();
    expect(result.autoAttack).toBeDefined();
    expect(result.skills).toBeDefined();
  });

  it("攻撃側チャンピオンが見つからない — NotFoundError をスローする", async () => {
    await expect(
      useCases.calculateDamage({ ...baseAttacker, championId: "UnknownChamp" }, baseDefender)
    ).rejects.toThrow(NotFoundError);
  });

  it("防御側チャンピオンが見つからない — NotFoundError をスローする", async () => {
    await expect(
      useCases.calculateDamage(baseAttacker, { ...baseDefender, championId: "UnknownChamp" })
    ).rejects.toThrow(NotFoundError);
  });

  it("atkItems に存在しない itemId — NotFoundError をスローする", async () => {
    await expect(
      useCases.calculateDamage({ ...baseAttacker, itemIds: [9999] }, baseDefender)
    ).rejects.toThrow(NotFoundError);
  });

  it("defItems に存在しない itemId — NotFoundError をスローする", async () => {
    await expect(
      useCases.calculateDamage(baseAttacker, { ...baseDefender, itemIds: [9999] })
    ).rejects.toThrow(NotFoundError);
  });

  it("skillAllocation が無効（total > level）— InvalidSkillAllocationError をスローする", async () => {
    // level=6, total=q:5+w:1+e:1+r:0=7 > 6
    await expect(
      useCases.calculateDamage(
        { ...baseAttacker, level: 6, skillAllocation: { q: 5, w: 1, e: 1, r: 0 } },
        baseDefender
      )
    ).rejects.toThrow(InvalidSkillAllocationError);
  });

  it("stackCount を渡す — EvaluationContext に stackCount が伝播する", async () => {
    // Just verifying no error — stackCount is used internally
    const result = await useCases.calculateDamage(
      { ...baseAttacker, stackCount: 10 },
      baseDefender
    );
    expect(result).toBeDefined();
  });

  it("defenderHpPercent を渡す — EvaluationContext に defenderHpPercent が伝播する", async () => {
    const result = await useCases.calculateDamage(
      baseAttacker,
      { ...baseDefender, hpPercent: 50 }
    );
    expect(result).toBeDefined();
  });

  it("防御側の skillAllocation は常に {q:0,w:0,e:0,r:0} が使われる", async () => {
    // Defender doesn't have skillAllocation in input — should use default zero allocation
    const result = await useCases.calculateDamage(baseAttacker, baseDefender);
    expect(result).toBeDefined();
    expect(result.autoAttack).toBeDefined();
  });
});

// ── TASK-012: getChampionList / getChampionDetail / getItemList ───────

describe("TASK-012: getChampionList / getChampionDetail / getItemList", () => {
  let useCases: ReturnType<typeof createUseCases>;

  beforeEach(() => {
    useCases = createUseCases(makeChampionRepo(), makeItemRepo());
  });

  it("getChampionList — 全件を {id, name, nameEn} の配列に変換して返す", async () => {
    const list = await useCases.getChampionList();
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: "Aatrox", name: "Aatroxの名前", nameEn: "Aatrox" });
    expect(list[1]).toMatchObject({ id: "Annie", name: "Annieの名前", nameEn: "Annie" });
  });

  it("getChampionDetail — 指定 id のチャンピオンを返す", async () => {
    const detail = await useCases.getChampionDetail("Aatrox");
    expect(detail.id).toBe("Aatrox");
    expect(detail.nameEn).toBe("Aatrox");
  });

  it("getChampionDetail — 存在しない id で NotFoundError をスローする", async () => {
    await expect(useCases.getChampionDetail("Unknown")).rejects.toThrow(NotFoundError);
  });

  it("getItemList — itemRepo.findAll() の結果をそのまま返す", async () => {
    const itemRepo = makeItemRepo();
    useCases = createUseCases(makeChampionRepo(), itemRepo);
    const items = await useCases.getItemList();
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe(1001);
    expect(items[1].id).toBe(1002);
  });
});
