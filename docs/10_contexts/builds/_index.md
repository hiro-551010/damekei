# builds コンテキスト

全ゲーム横断でユーザーの構築（パーティ構成等）の保存・シェアを担う Bounded Context。

ゲーム固有のデータ構造は `buildData: unknown`（JSONB）として持ち、このコンテキスト自体はゲーム知識を持たない。
Supabase（DB + Auth）を使用。

> **移行メモ**：旧 `contexts/team-builds/`（ポケモン固有）を汎化したもの。
> コード移行時にドメインモデルから `BuildSlot[]` を除去し `gameId + buildData` 形式に変更する。

---

## ドキュメント一覧

| ファイル | 内容 |
|---|---|
| [context.md](./context.md) | 責務・境界・依存関係 |
| [domain/model.md](./domain/model.md) | 集約・Entity・ValueObject の定義 |
| [domain/rules.md](./domain/rules.md) | 不変条件・バリデーションルール |
| [application/use-cases.md](./application/use-cases.md) | ユースケース一覧・入出力 |
| [data/schema.md](./data/schema.md) | DB スキーマ（Supabase / PostgreSQL） |

---

## ドメインモデル概要

```typescript
interface Build {
  id: string;
  userId: string;
  gameId: "pokemon" | "palworld";  // 追加ゲームごとに拡張
  name: string;
  shareToken: string;
  buildData: unknown;   // ゲーム固有の構造（JSONB）
  createdAt: Date;
  updatedAt: Date;
}
```

`buildData` の解釈は各ゲームの presentation 層が行う。`builds` コンテキスト自体はその内容を検証しない。

---

## フェーズ対応

| Phase | 機能 | 状態 |
|---|---|---|
| 2 | 構築の保存・シェア（DB・認証導入） | 完了（旧 team-builds として） |
| 2.5 | `gameId` 対応・`buildData` 汎化（マルチゲーム対応） | 未着手 |
| 3 | phantom-pokemon 構築への対応 | 未着手 |
