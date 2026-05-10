import { describe, it, expect } from "vitest";
import { validateSkillAllocation } from "@/contexts/games/lol/damage-calc/domain/models";
import { InvalidSkillAllocationError } from "@/contexts/games/lol/damage-calc/domain/errors";
import type { SkillAllocation } from "@/contexts/games/lol/damage-calc/domain/models";

function alloc(overrides: Partial<SkillAllocation> = {}): SkillAllocation {
  return { q: 0, w: 0, e: 0, r: 0, ...overrides };
}

describe("TASK-004: validateSkillAllocation", () => {
  // 正常系
  it("正常系: level=5, {q:2, w:1, e:1, r:0} — 例外なし（total=4 <= 5）", () => {
    expect(() => validateSkillAllocation(alloc({ q: 2, w: 1, e: 1, r: 0 }), 5)).not.toThrow();
  });

  it("正常系: level=18, {q:5, w:5, e:5, r:3} — 例外なし（total=18, maxR=3）", () => {
    expect(() => validateSkillAllocation(alloc({ q: 5, w: 5, e: 5, r: 3 }), 18)).not.toThrow();
  });

  it("正常系: level=1, {q:1, w:0, e:0, r:0} — 例外なし（total=1 <= 1）", () => {
    expect(() => validateSkillAllocation(alloc({ q: 1, w: 0, e: 0, r: 0 }), 1)).not.toThrow();
  });

  // 異常系
  it("total > level — InvalidSkillAllocationError をスローする", () => {
    // total=6 > level=5
    expect(() => validateSkillAllocation(alloc({ q: 3, w: 2, e: 1, r: 0 }), 5)).toThrow(InvalidSkillAllocationError);
  });

  it("r > maxR: level=5（maxR=0）で r=1 — InvalidSkillAllocationError をスローする", () => {
    // level=5, maxR = floor((5-1)/5) = 0
    expect(() => validateSkillAllocation(alloc({ q: 2, w: 1, e: 1, r: 1 }), 5)).toThrow(InvalidSkillAllocationError);
  });

  it("r > maxR: level=6（maxR=1）で r=2 — InvalidSkillAllocationError をスローする", () => {
    // level=6, maxR = floor((6-1)/5) = 1
    expect(() => validateSkillAllocation(alloc({ q: 2, w: 1, e: 1, r: 2 }), 6)).toThrow(InvalidSkillAllocationError);
  });

  it("r > maxR: level=11（maxR=2）で r=3 — InvalidSkillAllocationError をスローする", () => {
    // level=11, maxR = floor((11-1)/5) = 2
    expect(() => validateSkillAllocation(alloc({ q: 3, w: 2, e: 3, r: 3 }), 11)).toThrow(InvalidSkillAllocationError);
  });

  it("負のランク（q=-1）— InvalidSkillAllocationError をスローする", () => {
    expect(() => validateSkillAllocation(alloc({ q: -1, w: 1, e: 0, r: 0 }), 5)).toThrow(InvalidSkillAllocationError);
  });

  // 境界値
  it("境界値: level=5, total=5, r=0（maxR=0）— 例外なし", () => {
    expect(() => validateSkillAllocation(alloc({ q: 2, w: 2, e: 1, r: 0 }), 5)).not.toThrow();
  });

  it("境界値: level=18, r=3（maxR=3）— 例外なし", () => {
    // level=18, maxR = floor(17/5) = 3
    expect(() => validateSkillAllocation(alloc({ q: 5, w: 5, e: 5, r: 3 }), 18)).not.toThrow();
  });

  it("境界値: level=16, r=3（maxR=3）— 例外なし（15//5=3）", () => {
    // level=16, maxR = floor(15/5) = 3
    expect(() => validateSkillAllocation(alloc({ q: 5, w: 5, e: 3, r: 3 }), 16)).not.toThrow();
  });
});
