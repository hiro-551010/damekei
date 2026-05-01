import { TeamBuild, BuildSlot } from "./models";

export interface CreateBuildParams {
  userId: string;
  name: string;
  shareToken: string;
  slots: BuildSlot[];
}

export interface UpdateBuildParams {
  id: string;
  userId: string;
  name: string;
  slots: BuildSlot[];
}

export interface TeamBuildRepository {
  findById(id: string): Promise<TeamBuild | null>;
  findByShareToken(shareToken: string): Promise<TeamBuild | null>;
  findAllByUserId(userId: string): Promise<TeamBuild[]>;
  create(params: CreateBuildParams): Promise<TeamBuild>;
  update(params: UpdateBuildParams): Promise<TeamBuild>;
  delete(id: string, userId: string): Promise<void>;
}

export interface AuthService {
  getCurrentUserId(): Promise<string | null>;
}

export interface TokenGenerator {
  generate(): string;
}
