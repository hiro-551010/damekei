# Ports（builds）

domain 層が定義するインターフェース（依存の抽象）。実装は infrastructure 層に置く。

---

## TeamBuildRepository

構築データの永続化を担うリポジトリ。

| メソッド | 引数 | 戻り値 | 説明 |
|---|---|---|---|
| `findById` | `id: string` | `Promise<TeamBuild \| null>` | ID で構築を取得 |
| `findByShareToken` | `shareToken: string` | `Promise<TeamBuild \| null>` | 共有トークンで構築を取得 |
| `findAllByUserId` | `userId: string` | `Promise<TeamBuild[]>` | ユーザーの構築一覧を取得 |
| `create` | `CreateBuildParams` | `Promise<TeamBuild>` | 新規構築を作成 |
| `update` | `UpdateBuildParams` | `Promise<TeamBuild>` | 既存構築を更新 |
| `delete` | `id: string, userId: string` | `Promise<void>` | 構築を削除（所有者確認込み） |

### CreateBuildParams

| フィールド | 型 |
|---|---|
| `userId` | `string` |
| `name` | `string` |
| `shareToken` | `string` |
| `slots` | `BuildSlot[]` |

### UpdateBuildParams

| フィールド | 型 |
|---|---|
| `id` | `string` |
| `userId` | `string` |
| `name` | `string` |
| `slots` | `BuildSlot[]` |

---

## AuthService

現在ログイン中のユーザーIDを取得するサービス。

| メソッド | 戻り値 | 説明 |
|---|---|---|
| `getCurrentUserId` | `Promise<string \| null>` | 未ログイン時は `null` |

---

## TokenGenerator

共有トークンを生成するサービス。

| メソッド | 戻り値 | 説明 |
|---|---|---|
| `generate` | `string` | ランダムな共有トークン文字列 |
