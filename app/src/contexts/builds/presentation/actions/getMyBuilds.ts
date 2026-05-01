"use server";

import { createSupabaseServerClient } from "../../infrastructure/supabase-client";
import { SupabaseTeamBuildRepository } from "../../infrastructure/supabase-repository";
import { SupabaseAuthService } from "../../infrastructure/supabase-auth-service";
import { getMyBuilds } from "../../application/use-cases";
import { BuildSummaryDto } from "../../application/dto";

export async function getMyBuildsAction(): Promise<BuildSummaryDto[]> {
  const client = await createSupabaseServerClient();
  const repo = new SupabaseTeamBuildRepository(client);
  const auth = new SupabaseAuthService(client);
  return getMyBuilds(repo, auth);
}
