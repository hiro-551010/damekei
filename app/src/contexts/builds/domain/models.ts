import { DomainError } from "./errors";

export interface StatPoints {
  hp: number; attack: number; defense: number;
  spAttack: number; spDefense: number; speed: number;
}

export interface StatBoosts {
  attack: number; defense: number; spAttack: number; spDefense: number; speed: number;
}

export interface BuildSlot {
  slotIndex: number;
  pokemonId: number | null;
  nature: string;
  statPoints: StatPoints;
  abilityNameEn: string;
  itemNameEn: string;
  boosts: StatBoosts;
  moveNameEn: string;
}

export interface TeamBuild {
  id: string;
  userId: string;
  name: string;
  shareToken: string;
  slots: BuildSlot[];
  createdAt: Date;
  updatedAt: Date;
}

// ── バリデーション ──────────────────────────────────────────────────

export function validateBuildName(name: string): void {
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new DomainError("構築名を入力してください");
  if (trimmed.length > 50) throw new DomainError("構築名は50文字以内にしてください");
}

export function validateBuildSlot(slot: BuildSlot): void {
  if (slot.pokemonId === null) return;
  const sp = slot.statPoints;
  const keys = ["hp", "attack", "defense", "spAttack", "spDefense", "speed"] as const;
  for (const k of keys) {
    if (sp[k] < 0 || sp[k] > 32) throw new DomainError(`statPoints.${k} は 0〜32 の範囲で指定してください`);
  }
  const total = keys.reduce((s, k) => s + sp[k], 0);
  if (total > 66) throw new DomainError(`能力ポイントの合計は 66 以下にしてください（現在: ${total}）`);
}

export function normalizeSlots(slots: BuildSlot[]): BuildSlot[] {
  const DEFAULT_SP: StatPoints = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
  const DEFAULT_BOOSTS: StatBoosts = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
  return Array.from({ length: 6 }, (_, i) => {
    const found = slots.find((s) => s.slotIndex === i);
    return found ?? {
      slotIndex: i, pokemonId: null, nature: "hardy",
      statPoints: DEFAULT_SP, abilityNameEn: "", itemNameEn: "",
      boosts: DEFAULT_BOOSTS, moveNameEn: "",
    };
  });
}
