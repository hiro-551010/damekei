import { TeamBuildRepository, AuthService, TokenGenerator } from "../domain/ports";
import { validateBuildName, validateBuildSlot, normalizeSlots } from "../domain/models";
import { AuthError, ForbiddenError, NotFoundError } from "../domain/errors";
import { SaveBuildInput, SaveBuildResult, BuildSummaryDto, BuildDetailDto } from "./dto";

export async function saveBuild(
  repo: TeamBuildRepository,
  auth: AuthService,
  tokenGen: TokenGenerator,
  input: SaveBuildInput,
): Promise<SaveBuildResult> {
  const userId = await auth.getCurrentUserId();
  if (!userId) throw new AuthError();

  validateBuildName(input.name);
  const slots = normalizeSlots(input.slots);
  slots.forEach(validateBuildSlot);

  const name = input.name.trim();

  if (input.id) {
    const existing = await repo.findById(input.id);
    if (!existing) throw new NotFoundError("構築が見つかりません");
    if (existing.userId !== userId) throw new ForbiddenError();

    const updated = await repo.update({ id: input.id, userId, name, slots });
    return { id: updated.id, shareToken: updated.shareToken };
  }

  const shareToken = tokenGen.generate();
  const created = await repo.create({ userId, name, shareToken, slots });
  return { id: created.id, shareToken: created.shareToken };
}

export async function deleteBuild(
  repo: TeamBuildRepository,
  auth: AuthService,
  id: string,
): Promise<void> {
  const userId = await auth.getCurrentUserId();
  if (!userId) throw new AuthError();

  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError("構築が見つかりません");
  if (existing.userId !== userId) throw new ForbiddenError();

  await repo.delete(id, userId);
}

export async function getMyBuilds(
  repo: TeamBuildRepository,
  auth: AuthService,
): Promise<BuildSummaryDto[]> {
  const userId = await auth.getCurrentUserId();
  if (!userId) throw new AuthError();

  const builds = await repo.findAllByUserId(userId);
  return builds.map((b) => ({
    id: b.id,
    name: b.name,
    shareToken: b.shareToken,
    slotCount: b.slots.filter((s) => s.pokemonId !== null).length,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));
}

export async function getBuildByShareToken(
  repo: TeamBuildRepository,
  shareToken: string,
): Promise<BuildDetailDto> {
  const build = await repo.findByShareToken(shareToken);
  if (!build) throw new NotFoundError("構築が見つかりません");

  return {
    id: build.id,
    name: build.name,
    shareToken: build.shareToken,
    slots: build.slots,
    createdAt: build.createdAt.toISOString(),
    updatedAt: build.updatedAt.toISOString(),
  };
}
