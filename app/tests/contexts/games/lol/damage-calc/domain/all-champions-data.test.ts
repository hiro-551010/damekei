import { describe, it, expect } from "vitest";
import championsRaw from "@/contexts/games/lol/damage-calc/infrastructure/data/champions.json";
import type { ChampionSpecies } from "@/contexts/games/lol/damage-calc/domain/models";

const champions = championsRaw as unknown as ChampionSpecies[];

describe("全チャンピオン データ完全性チェック（170体）", () => {
  it("champions.json に 170 件のエントリがある", () => {
    expect(champions).toHaveLength(170);
  });

  describe.each(champions)("$id ($nameEn)", (champion) => {
    it("id が空でない string", () => {
      expect(typeof champion.id).toBe("string");
      expect(champion.id.length).toBeGreaterThan(0);
    });

    it("name が空でない string（日本語名）", () => {
      expect(typeof champion.name).toBe("string");
      expect(champion.name.length).toBeGreaterThan(0);
    });

    it("nameEn が空でない string", () => {
      expect(typeof champion.nameEn).toBe("string");
      expect(champion.nameEn.length).toBeGreaterThan(0);
    });

    it("baseStats.hp > 0", () => {
      expect(champion.baseStats.hp).toBeGreaterThan(0);
    });

    it("baseStats.ad > 0", () => {
      expect(champion.baseStats.ad).toBeGreaterThan(0);
    });

    it("baseStats.armor >= 0", () => {
      expect(champion.baseStats.armor).toBeGreaterThanOrEqual(0);
    });

    it("baseStats.magicResist >= 0", () => {
      expect(champion.baseStats.magicResist).toBeGreaterThanOrEqual(0);
    });

    it("baseStats.attackSpeed > 0", () => {
      expect(champion.baseStats.attackSpeed).toBeGreaterThan(0);
    });

    it("baseStats.moveSpeed > 0", () => {
      expect(champion.baseStats.moveSpeed).toBeGreaterThan(0);
    });

    it("skills に 1 件以上のスキルがある", () => {
      expect(champion.skills.length).toBeGreaterThanOrEqual(1);
    });

    describe.each(champion.skills)("skill $slot ($name)", (skill) => {
      it("slot が Q / W / E / R のいずれか", () => {
        expect(["Q", "W", "E", "R"]).toContain(skill.slot);
      });

      it("name が空でない string", () => {
        expect(typeof skill.name).toBe("string");
        expect(skill.name.length).toBeGreaterThan(0);
      });

      it("damageType が physical / magic / true のいずれか", () => {
        expect(["physical", "magic", "true"]).toContain(skill.damageType);
      });

      it("damageFormula が定義されている（undefined でも null でもない）", () => {
        expect(skill.damageFormula).not.toBeUndefined();
        expect(skill.damageFormula).not.toBeNull();
      });
    });
  });
});
