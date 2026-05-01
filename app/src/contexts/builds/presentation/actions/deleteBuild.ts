"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../infrastructure/supabase-client";
import { SupabaseTeamBuildRepository } from "../../infrastructure/supabase-repository";
import { SupabaseAuthService } from "../../infrastructure/supabase-auth-service";
import { deleteBuild } from "../../application/use-cases";

export async function deleteBuildAction(id: string): Promise<void> {
  const client = await createSupabaseServerClient();
  const repo = new SupabaseTeamBuildRepository(client);
  const auth = new SupabaseAuthService(client);
  await deleteBuild(repo, auth, id);
  revalidatePath("/my-builds");
}
