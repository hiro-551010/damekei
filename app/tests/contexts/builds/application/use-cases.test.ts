import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveBuild,
  deleteBuild,
  getMyBuilds,
  getBuildByShareToken,
} from "@/contexts/builds/application/use-cases";
import { AuthError, ForbiddenError, NotFoundError, DomainError } from "@/contexts/builds/domain/errors";
import type {
  TeamBuildRepository,
  AuthService,
  TokenGenerator,
} from "@/contexts/builds/domain/ports";
import type { TeamBuild, BuildSlot, StatPoints, StatBoosts } from "@/contexts/builds/domain/models";

// ── ヘルパー ────────────────────────────────────────────────────────

function makeStatPoints(overrides: Partial<StatPoints> = {}): StatPoints {
  return { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, ...overrides };
}

function makeBoosts(overrides: Partial<StatBoosts> = {}): StatBoosts {
  return { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, ...overrides };
}

function makeSlot(slotIndex: number, pokemonId: number | null = null): BuildSlot {
  return {
    slotIndex,
    pokemonId,
    nature: "hardy",
    statPoints: makeStatPoints(),
    abilityNameEn: "",
    itemNameEn: "",
    boosts: makeBoosts(),
    moveNameEn: "",
  };
}

function makeTeamBuild(overrides: Partial<TeamBuild> = {}): TeamBuild {
  return {
    id: "build-001",
    userId: "user-001",
    name: "テスト構築",
    shareToken: "token-abc",
    slots: Array.from({ length: 6 }, (_, i) => makeSlot(i)),
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-02T00:00:00Z"),
    ...overrides,
  };
}

function makeAuth(userId: string | null = "user-001"): AuthService {
  return { getCurrentUserId: vi.fn().mockResolvedValue(userId) };
}

function makeTokenGen(token = "new-token-xyz"): TokenGenerator {
  return { generate: vi.fn().mockReturnValue(token) };
}

function makeRepo(builds: TeamBuild[] = []): TeamBuildRepository {
  return {
    findById: vi.fn().mockImplementation((id: string) =>
      Promise.resolve(builds.find((b) => b.id === id) ?? null)
    ),
    findByShareToken: vi.fn().mockImplementation((token: string) =>
      Promise.resolve(builds.find((b) => b.shareToken === token) ?? null)
    ),
    findAllByUserId: vi.fn().mockImplementation((userId: string) =>
      Promise.resolve(builds.filter((b) => b.userId === userId))
    ),
    create: vi.fn().mockImplementation(async (params) =>
      makeTeamBuild({
        id: "created-id",
        userId: params.userId,
        name: params.name,
        shareToken: params.shareToken,
        slots: params.slots,
      })
    ),
    update: vi.fn().mockImplementation(async (params) =>
      makeTeamBuild({
        id: params.id,
        userId: params.userId,
        name: params.name,
        slots: params.slots,
        shareToken: "token-abc",
      })
    ),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

// ── TASK-015: saveBuild ───────────────────────────────────────────────

describe("TASK-015: builds use-cases — saveBuild", () => {
  let repo: ReturnType<typeof makeRepo>;
  let auth: ReturnType<typeof makeAuth>;
  let tokenGen: ReturnType<typeof makeTokenGen>;

  beforeEach(() => {
    repo = makeRepo();
    auth = makeAuth("user-001");
    tokenGen = makeTokenGen();
  });

  it("正常系（新規作成）— userId あり, id なし → repo.create が呼ばれ {id, shareToken} が返る", async () => {
    tokenGen = makeTokenGen("token-new");
    const result = await saveBuild(repo, auth, tokenGen, {
      name: "新規構築",
      slots: [],
    });
    expect(repo.create).toHaveBeenCalledOnce();
    expect(result.id).toBe("created-id");
    expect(result.shareToken).toBe("token-new");
  });

  it("正常系（更新）— userId あり, id あり, existing の userId が一致 → repo.update が呼ばれる", async () => {
    const existing = makeTeamBuild({ id: "build-001", userId: "user-001" });
    repo = makeRepo([existing]);
    await saveBuild(repo, auth, tokenGen, {
      id: "build-001",
      name: "更新構築",
      slots: [],
    });
    expect(repo.update).toHaveBeenCalledOnce();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("未ログイン（userId=null）— AuthError をスローする", async () => {
    auth = makeAuth(null);
    await expect(
      saveBuild(repo, auth, tokenGen, { name: "構築", slots: [] })
    ).rejects.toThrow(AuthError);
  });

  it("構築名が空文字 — DomainError をスローする", async () => {
    await expect(
      saveBuild(repo, auth, tokenGen, { name: "", slots: [] })
    ).rejects.toThrow(DomainError);
  });

  it("構築名が 51 文字 — DomainError をスローする", async () => {
    await expect(
      saveBuild(repo, auth, tokenGen, { name: "あ".repeat(51), slots: [] })
    ).rejects.toThrow(DomainError);
  });

  it("id あり, existing が見つからない — NotFoundError をスローする", async () => {
    // repo has no builds
    await expect(
      saveBuild(repo, auth, tokenGen, { id: "nonexistent-id", name: "構築", slots: [] })
    ).rejects.toThrow(NotFoundError);
  });

  it("id あり, existing.userId が不一致 — ForbiddenError をスローする", async () => {
    const existing = makeTeamBuild({ id: "build-001", userId: "other-user" });
    repo = makeRepo([existing]);
    await expect(
      saveBuild(repo, auth, tokenGen, { id: "build-001", name: "構築", slots: [] })
    ).rejects.toThrow(ForbiddenError);
  });

  it("無効な buildSlot（SP 合計 > 66）— DomainError をスローする", async () => {
    const badSlot: BuildSlot = makeSlot(0, 1); // pokemonId=1
    badSlot.statPoints = makeStatPoints({ hp: 32, attack: 32, defense: 10 }); // total=74
    await expect(
      saveBuild(repo, auth, tokenGen, { name: "構築", slots: [badSlot] })
    ).rejects.toThrow(DomainError);
  });

  it("slots が空 — normalizeSlots で 6 スロットが補完される", async () => {
    await saveBuild(repo, auth, tokenGen, { name: "構築", slots: [] });
    const createCall = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.slots).toHaveLength(6);
  });

  it("name.trim() — 前後スペースが除去されて保存される", async () => {
    await saveBuild(repo, auth, tokenGen, { name: "  構築名  ", slots: [] });
    const createCall = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.name).toBe("構築名");
  });

  it("新規作成時 — tokenGen.generate() が呼ばれ shareToken が設定される", async () => {
    tokenGen = makeTokenGen("generated-token");
    await saveBuild(repo, auth, tokenGen, { name: "構築", slots: [] });
    expect(tokenGen.generate).toHaveBeenCalledOnce();
    const createCall = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.shareToken).toBe("generated-token");
  });
});

// ── TASK-016: deleteBuild / getMyBuilds / getBuildByShareToken ────────

describe("TASK-016: builds use-cases — deleteBuild / getMyBuilds / getBuildByShareToken", () => {
  // ── deleteBuild ──────────────────────────────────────────────────

  describe("deleteBuild", () => {
    it("正常系 — userId あり, existing の userId 一致 → repo.delete が呼ばれる", async () => {
      const existing = makeTeamBuild({ id: "build-001", userId: "user-001" });
      const repo = makeRepo([existing]);
      const auth = makeAuth("user-001");
      await deleteBuild(repo, auth, "build-001");
      expect(repo.delete).toHaveBeenCalledOnce();
      expect(repo.delete).toHaveBeenCalledWith("build-001", "user-001");
    });

    it("未ログイン — AuthError をスローする", async () => {
      await expect(deleteBuild(makeRepo(), makeAuth(null), "build-001")).rejects.toThrow(AuthError);
    });

    it("存在しない id — NotFoundError をスローする", async () => {
      // no builds
      await expect(deleteBuild(makeRepo(), makeAuth("user-001"), "nonexistent")).rejects.toThrow(NotFoundError);
    });

    it("existing.userId が不一致 — ForbiddenError をスローする", async () => {
      const existing = makeTeamBuild({ id: "build-001", userId: "other-user" });
      await expect(deleteBuild(makeRepo([existing]), makeAuth("user-001"), "build-001")).rejects.toThrow(ForbiddenError);
    });
  });

  // ── getMyBuilds ──────────────────────────────────────────────────

  describe("getMyBuilds", () => {
    it("正常系 — userId のビルド一覧を {id, name, shareToken, slotCount, createdAt, updatedAt} の配列で返す", async () => {
      const builds = [
        makeTeamBuild({ id: "b1", userId: "user-001", name: "構築1" }),
        makeTeamBuild({ id: "b2", userId: "user-001", name: "構築2" }),
      ];
      const result = await getMyBuilds(makeRepo(builds), makeAuth("user-001"));
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: "b1", name: "構築1" });
      expect(result[0]).toHaveProperty("slotCount");
      expect(result[0]).toHaveProperty("createdAt");
      expect(result[0]).toHaveProperty("updatedAt");
      expect(result[0]).toHaveProperty("shareToken");
    });

    it("未ログイン — AuthError をスローする", async () => {
      await expect(getMyBuilds(makeRepo(), makeAuth(null))).rejects.toThrow(AuthError);
    });

    it("slotCount — pokemonId が null でないスロット数をカウントする", async () => {
      const slots = [
        makeSlot(0, 1),   // pokemonId=1 → count
        makeSlot(1, 2),   // pokemonId=2 → count
        makeSlot(2, null), // null → skip
        makeSlot(3, null),
        makeSlot(4, null),
        makeSlot(5, null),
      ];
      const builds = [makeTeamBuild({ id: "b1", userId: "user-001", slots })];
      const result = await getMyBuilds(makeRepo(builds), makeAuth("user-001"));
      expect(result[0].slotCount).toBe(2);
    });

    it("createdAt / updatedAt — ISO 8601 文字列に変換される", async () => {
      const builds = [
        makeTeamBuild({
          id: "b1",
          userId: "user-001",
          createdAt: new Date("2025-03-15T10:00:00Z"),
          updatedAt: new Date("2025-03-16T12:00:00Z"),
        }),
      ];
      const result = await getMyBuilds(makeRepo(builds), makeAuth("user-001"));
      expect(result[0].createdAt).toBe("2025-03-15T10:00:00.000Z");
      expect(result[0].updatedAt).toBe("2025-03-16T12:00:00.000Z");
    });
  });

  // ── getBuildByShareToken ─────────────────────────────────────────

  describe("getBuildByShareToken", () => {
    it("正常系 — shareToken が一致するビルドの詳細を返す", async () => {
      const builds = [makeTeamBuild({ id: "b1", shareToken: "token-xyz" })];
      const repo = makeRepo(builds);
      const result = await getBuildByShareToken(repo, "token-xyz");
      expect(result.id).toBe("b1");
      expect(result.shareToken).toBe("token-xyz");
      expect(result.slots).toHaveLength(6);
    });

    it("存在しない shareToken — NotFoundError をスローする", async () => {
      const repo = makeRepo();
      await expect(getBuildByShareToken(repo, "nonexistent-token")).rejects.toThrow(NotFoundError);
    });

    it("createdAt / updatedAt — ISO 8601 文字列に変換される", async () => {
      const builds = [
        makeTeamBuild({
          id: "b1",
          shareToken: "token-abc",
          createdAt: new Date("2025-05-01T08:00:00Z"),
          updatedAt: new Date("2025-05-02T09:00:00Z"),
        }),
      ];
      const repo = makeRepo(builds);
      const result = await getBuildByShareToken(repo, "token-abc");
      expect(result.createdAt).toBe("2025-05-01T08:00:00.000Z");
      expect(result.updatedAt).toBe("2025-05-02T09:00:00.000Z");
    });
  });
});
