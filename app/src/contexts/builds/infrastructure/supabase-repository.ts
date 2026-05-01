import { SupabaseClient } from "@supabase/supabase-js";
import { TeamBuildRepository, CreateBuildParams, UpdateBuildParams } from "../domain/ports";
import { TeamBuild, BuildSlot } from "../domain/models";
import { NotFoundError } from "../domain/errors";

type Row = {
  id: string;
  user_id: string;
  name: string;
  share_token: string;
  slots: BuildSlot[];
  created_at: string;
  updated_at: string;
};

function toModel(row: Row): TeamBuild {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    shareToken: row.share_token,
    slots: row.slots,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseTeamBuildRepository implements TeamBuildRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<TeamBuild | null> {
    const { data } = await this.client
      .from("team_builds")
      .select("*")
      .eq("id", id)
      .single();
    return data ? toModel(data as Row) : null;
  }

  async findByShareToken(shareToken: string): Promise<TeamBuild | null> {
    const { data } = await this.client
      .from("team_builds")
      .select("*")
      .eq("share_token", shareToken)
      .single();
    return data ? toModel(data as Row) : null;
  }

  async findAllByUserId(userId: string): Promise<TeamBuild[]> {
    const { data } = await this.client
      .from("team_builds")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    return (data ?? []).map((r) => toModel(r as Row));
  }

  async create(params: CreateBuildParams): Promise<TeamBuild> {
    const { data, error } = await this.client
      .from("team_builds")
      .insert({
        user_id: params.userId,
        name: params.name,
        share_token: params.shareToken,
        slots: params.slots,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "構築の保存に失敗しました");
    return toModel(data as Row);
  }

  async update(params: UpdateBuildParams): Promise<TeamBuild> {
    const { data, error } = await this.client
      .from("team_builds")
      .update({ name: params.name, slots: params.slots })
      .eq("id", params.id)
      .eq("user_id", params.userId)
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "構築の更新に失敗しました");
    return toModel(data as Row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from("team_builds")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  }
}
