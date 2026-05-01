"use server";

import { createSupabaseServerClient } from "../../infrastructure/supabase-client";
import { SupabaseTeamBuildRepository } from "../../infrastructure/supabase-repository";
import { SupabaseAuthService } from "../../infrastructure/supabase-auth-service";
import { CryptoTokenGenerator } from "../../infrastructure/token-generator";
import { saveBuild } from "../../application/use-cases";
import { SaveBuildInput, SaveBuildResult } from "../../application/dto";

export async function saveBuildAction(input: SaveBuildInput): Promise<SaveBuildResult> {
  const client = await createSupabaseServerClient();
  const repo = new SupabaseTeamBuildRepository(client);
  const auth = new SupabaseAuthService(client);
  const tokenGen = new CryptoTokenGenerator();
  return saveBuild(repo, auth, tokenGen, input);
}
