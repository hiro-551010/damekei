import { describe, it, expect } from "vitest";
import { calcActualSpeed } from "@/contexts/games/pokemon/damage-calc/presentation/utils/speedCalc";

// レベル 50・IV 31 固定
// raw = floor(floor((2*base + 31 + floor(ev/4)) * 50/100) + 5)

describe("calcActualSpeed", () => {
  describe("性格補正なし（hardy 等）", () => {
    it("種族値 100・SP 0", () => {
      // raw = floor(floor((200+31)*50/100)+5) = floor(floor(115.5)+5) = floor(115+5) = 120
      expect(calcActualSpeed(100, 0, "hardy", 0, "")).toBe(120);
    });

    it("種族値 80・SP 0（フシギバナ）", () => {
      // raw = floor(floor((160+31)*50/100)+5) = floor(95.5)+5 = 95+5 = 100
      expect(calcActualSpeed(80, 0, "hardy", 0, "")).toBe(100);
    });
  });

  describe("性格補正あり", () => {
    it("おくびょう（+10%）", () => {
      // base 100, raw 120 → floor(120 * 1.1) = floor(132) = 132
      expect(calcActualSpeed(100, 0, "timid", 0, "")).toBe(132);
    });

    it("ゆうかん（-10%）", () => {
      // base 100, raw 120 → floor(120 * 0.9) = floor(108) = 108
      expect(calcActualSpeed(100, 0, "brave", 0, "")).toBe(108);
    });

    it("はやて（+10%）", () => {
      expect(calcActualSpeed(100, 0, "hasty", 0, "")).toBe(132);
    });

    it("のんき（-10%）", () => {
      expect(calcActualSpeed(100, 0, "relaxed", 0, "")).toBe(108);
    });
  });

  describe("能力ポイント（SP）", () => {
    it("SP 8 は EV 32 相当", () => {
      // ev=32, raw = floor(floor((200+31+8)*50/100)+5) = floor(119)+5 = 119+5 = 124...
      // floor((239*50)/100) = floor(119.5) = 119, +5 = 124
      expect(calcActualSpeed(100, 8, "hardy", 0, "")).toBe(124);
    });

    it("SP 32 は EV 128 相当", () => {
      // ev=128, raw = floor(floor((200+31+32)*50/100)+5) = floor(131.5)+5 = 131+5 = 136
      expect(calcActualSpeed(100, 32, "hardy", 0, "")).toBe(136);
    });
  });

  describe("ランク補正", () => {
    it("+1 は (2+1)/2 = 1.5 倍", () => {
      // 120 * 1.5 = 180
      expect(calcActualSpeed(100, 0, "hardy", 1, "")).toBe(180);
    });

    it("+2 は 2.0 倍", () => {
      expect(calcActualSpeed(100, 0, "hardy", 2, "")).toBe(240);
    });

    it("-1 は 2/(2+1) = 0.666... 倍", () => {
      // floor(120 * 2/3) = floor(80) = 80
      expect(calcActualSpeed(100, 0, "hardy", -1, "")).toBe(80);
    });

    it("-2 は 2/4 = 0.5 倍", () => {
      expect(calcActualSpeed(100, 0, "hardy", -2, "")).toBe(60);
    });

    it("ランク 0 は補正なし", () => {
      expect(calcActualSpeed(100, 0, "hardy", 0, "")).toBe(120);
    });
  });

  describe("持ち物補正", () => {
    it("こだわりスカーフ（1.5 倍）", () => {
      // floor(120 * 1.5) = 180
      expect(calcActualSpeed(100, 0, "hardy", 0, "choice-scarf")).toBe(180);
    });

    it("くろいてっきゅう（0.5 倍）", () => {
      // floor(120 * 0.5) = 60
      expect(calcActualSpeed(100, 0, "hardy", 0, "iron-ball")).toBe(60);
    });

    it("その他の持ち物は補正なし", () => {
      expect(calcActualSpeed(100, 0, "hardy", 0, "leftovers")).toBe(120);
    });

    it("持ち物なし（空文字）は補正なし", () => {
      expect(calcActualSpeed(100, 0, "hardy", 0, "")).toBe(120);
    });
  });

  describe("複合", () => {
    it("おくびょう + こだわりスカーフ + ランク+1", () => {
      // raw=120, nature=1.1→132, rank+1=1.5→198, scarf=1.5→floor(297)=297
      expect(calcActualSpeed(100, 0, "timid", 1, "choice-scarf")).toBe(297);
    });
  });
});
