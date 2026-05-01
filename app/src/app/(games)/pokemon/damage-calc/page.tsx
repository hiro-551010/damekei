import { pokemonRepository } from "@/contexts/games/pokemon/damage-calc/infrastructure/container";
import { getPokemonList } from "@/contexts/games/pokemon/damage-calc/application/use-cases";
import DamageCalcPage from "@/contexts/games/pokemon/damage-calc/presentation/DamageCalcPage";
import { createSupabaseServerClient } from "@/contexts/builds/infrastructure/supabase-client";
import { SupabaseAuthService } from "@/contexts/builds/infrastructure/supabase-auth-service";
import { SupabaseTeamBuildRepository } from "@/contexts/builds/infrastructure/supabase-repository";
import { getBuildByShareToken } from "@/contexts/builds/application/use-cases";
import { BuildDetailDto } from "@/contexts/builds/application/dto";

interface Props {
  searchParams: Promise<{ build?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const pokemonList = getPokemonList(pokemonRepository);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const client = await createSupabaseServerClient();
  const auth = new SupabaseAuthService(client);
  const userId = await auth.getCurrentUserId();
  const isLoggedIn = userId !== null;

  const { build: shareToken } = await searchParams;
  let initialBuild: BuildDetailDto | null = null;
  if (shareToken) {
    try {
      const repo = new SupabaseTeamBuildRepository(client);
      initialBuild = await getBuildByShareToken(repo, shareToken);
    } catch {
      // 無効なトークンは無視して通常表示
    }
  }

  return (
    <DamageCalcPage
      pokemonList={pokemonList}
      isLoggedIn={isLoggedIn}
      appUrl={appUrl}
      initialBuild={initialBuild}
    />
  );
}
