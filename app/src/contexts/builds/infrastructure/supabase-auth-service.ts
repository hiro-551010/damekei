import { SupabaseClient } from "@supabase/supabase-js";
import { AuthService } from "../domain/ports";

export class SupabaseAuthService implements AuthService {
  constructor(private readonly client: SupabaseClient) {}

  async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await this.client.auth.getUser();
    return user?.id ?? null;
  }
}
