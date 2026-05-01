import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/contexts/builds/infrastructure/supabase-client";
import { SupabaseTeamBuildRepository } from "@/contexts/builds/infrastructure/supabase-repository";
import { SupabaseAuthService } from "@/contexts/builds/infrastructure/supabase-auth-service";
import { getMyBuilds } from "@/contexts/builds/application/use-cases";
import MyBuildsPage from "@/contexts/builds/presentation/components/MyBuildsPage";

export default async function Page() {
  const client = await createSupabaseServerClient();
  const auth = new SupabaseAuthService(client);
  const userId = await auth.getCurrentUserId();
  if (!userId) redirect("/auth/login");

  const repo = new SupabaseTeamBuildRepository(client);
  const builds = await getMyBuilds(repo, auth);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return <MyBuildsPage builds={builds} appUrl={appUrl} />;
}
