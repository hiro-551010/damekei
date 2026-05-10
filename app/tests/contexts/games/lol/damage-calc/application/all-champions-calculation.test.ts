import { describe, it, expect } from "vitest";
import { createUseCases } from "@/contexts/games/lol/damage-calc/application/use-cases";
import { championRepository } from "@/contexts/games/lol/damage-calc/infrastructure/champion-repository";
import { itemRepository } from "@/contexts/games/lol/damage-calc/infrastructure/item-repository";

const useCases = createUseCases(championRepository, itemRepository);

const DEFENDER_ID = "Aatrox";

function isFiniteNumber(v: number): boolean {
  return !Number.isNaN(v) && Number.isFinite(v);
}

describe("全チャンピオン calculateDamage 回帰テスト（170体）", () => {
  let allChampionIds: string[];

  // 全チャンピオン ID を事前取得（beforeAll 相当として最初の it で取得するのを避けるため describe.each の外で同期的に取得）
  // vitest では describe 内で非同期前処理を行うには beforeAll を使う
  // ここでは全体をひとつの describe で包み、beforeAll でリストを取得する

  it.todo("dummy – replaced by dynamic tests below");
});

describe("全チャンピオン calculateDamage 動的テスト", async () => {
  const allSpecies = await championRepository.findAll();

  describe.each(allSpecies)("attacker: $id ($nameEn)", (species) => {
    it("calculateDamage がエラーをスローせず結果を返す", async () => {
      const result = await useCases.calculateDamage(
        {
          championId: species.id,
          level: 1,
          itemIds: [],
          skillAllocation: { q: 1, w: 0, e: 0, r: 0 },
        },
        {
          championId: DEFENDER_ID,
          level: 1,
          itemIds: [],
        }
      );

      // autoAttack の検証
      expect(isFiniteNumber(result.autoAttack.preMitigation)).toBe(true);
      expect(result.autoAttack.preMitigation).toBeGreaterThan(0);
      expect(isFiniteNumber(result.autoAttack.postMitigation)).toBe(true);
      expect(result.autoAttack.postMitigation).toBeGreaterThanOrEqual(0);

      // skills 配列の存在確認
      expect(Array.isArray(result.skills)).toBe(true);

      // 各スキルの数値検証
      for (const skill of result.skills) {
        expect(
          isFiniteNumber(skill.preMitigation),
          `${species.id} skill ${skill.slot} preMitigation is NaN or Infinity`
        ).toBe(true);
        expect(
          isFiniteNumber(skill.postMitigation),
          `${species.id} skill ${skill.slot} postMitigation is NaN or Infinity`
        ).toBe(true);
      }
    });
  });
});
