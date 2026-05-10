import { describe, it, expect } from "vitest";
import { itemRepository } from "@/contexts/games/lol/damage-calc/infrastructure/item-repository";
import { championRepository } from "@/contexts/games/lol/damage-calc/infrastructure/champion-repository";
import { createUseCases } from "@/contexts/games/lol/damage-calc/application/use-cases";

const STATIC_SHIV_ID = 3087;

describe("スタティックシブ（3087）統合テスト", () => {
  describe("1. リポジトリマージの確認", () => {
    it("findById(3087) でアイテムが取得できること", async () => {
      const item = await itemRepository.findById(STATIC_SHIV_ID);
      expect(item).not.toBeNull();
      expect(item!.id).toBe(STATIC_SHIV_ID);
      expect(item!.nameEn).toBe("Statikk Shiv");
    });

    it("passives に { kind: 'onHitMagicDamage', damage: 60 } が含まれること", async () => {
      const item = await itemRepository.findById(STATIC_SHIV_ID);
      expect(item).not.toBeNull();
      const onHitPassive = item!.passives.find((p) => p.kind === "onHitMagicDamage");
      expect(onHitPassive).toBeDefined();
      expect(onHitPassive).toEqual({ kind: "onHitMagicDamage", damage: 60 });
    });
  });

  describe("2. ダメージ計算への反映", () => {
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

    it("アイテムなし（ベースライン）の場合 onHitMagicPostMitigation が null であること", async () => {
      const result = await useCases.calculateDamage(baseAttacker, baseDefender);
      expect(result.autoAttack.onHitMagicPostMitigation).toBeNull();
    });

    it("スタティックシブ装備時に onHitMagicPostMitigation が null でなくなること", async () => {
      const result = await useCases.calculateDamage(
        { ...baseAttacker, itemIds: [STATIC_SHIV_ID] },
        baseDefender,
      );
      expect(result.autoAttack.onHitMagicPostMitigation).not.toBeNull();
    });

    it("Aatrox（MR=32）に対して onHitMagicPostMitigation が 60 * 100/(100+32) ≒ 45 であること", async () => {
      // effectiveMR = 32（magic pen なし）
      // postMitigation = Math.round(60 * 100 / 132) = 45
      const result = await useCases.calculateDamage(
        { ...baseAttacker, itemIds: [STATIC_SHIV_ID] },
        baseDefender,
      );
      expect(result.autoAttack.onHitMagicPostMitigation).toBe(45);
    });

    it("MR が高い防御側に対して値が低くなること（軽減が機能している）", async () => {
      // 低MR（レベル1 Aatrox: MR=32）での値
      const resultLowMr = await useCases.calculateDamage(
        { ...baseAttacker, itemIds: [STATIC_SHIV_ID] },
        baseDefender,
      );

      // 高MR（レベル18 Aatrox: MR=32 + 2.05*17*... ≒ 68 程度）での値
      const resultHighMr = await useCases.calculateDamage(
        { ...baseAttacker, itemIds: [STATIC_SHIV_ID] },
        { ...baseDefender, level: 18 },
      );

      expect(resultLowMr.autoAttack.onHitMagicPostMitigation).not.toBeNull();
      expect(resultHighMr.autoAttack.onHitMagicPostMitigation).not.toBeNull();
      expect(resultHighMr.autoAttack.onHitMagicPostMitigation!).toBeLessThan(
        resultLowMr.autoAttack.onHitMagicPostMitigation!,
      );
    });
  });
});
