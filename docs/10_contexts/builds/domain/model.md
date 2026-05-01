# ドメインモデル（team-builds）

## 集約・Entity・ValueObject 一覧

```
TeamBuild（集約ルート・Entity）
  ├── id: BuildId               ← UUID
  ├── userId: UserId            ← Supabase Auth の user.id
  ├── name: BuildName           ← 構築名
  ├── shareToken: ShareToken    ← 公開 URL 用のランダムトークン
  ├── slots: BuildSlot[]        ← 6枠（0〜5）
  ├── createdAt: Date
  └── updatedAt: Date

BuildSlot（ValueObject）
  ├── slotIndex: number         ← 0〜5
  ├── pokemonId: number | null  ← 全国図鑑番号。null = 空欄
  ├── nature: string            ← 英語名
  ├── statPoints: StatPoints    ← damage-calc の StatPoints と同形
  ├── abilityNameEn: string
  ├── itemNameEn: string
  ├── boosts: StatBoosts        ← damage-calc の StatBoosts と同形
  └── moveNameEn: string        ← 選択中のわざ英語名（空文字 = 未選択）
```

---

## TeamBuild（集約ルート）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string`（UUID） | 構築の一意識別子 |
| `userId` | `string` | 作成者の Supabase Auth user.id |
| `name` | `string` | 構築名（1〜50 文字） |
| `shareToken` | `string` | 共有 URL に埋め込むトークン（URL-safe、16 文字以上） |
| `slots` | `BuildSlot[]` | 6 枠固定（空枠は pokemonId: null） |
| `createdAt` | `Date` | 作成日時 |
| `updatedAt` | `Date` | 更新日時 |

---

## ValueObject 定義

### BuildSlot

damage-calc の攻撃側タブ1枠の設定をそのまま保持する。

| フィールド | 型 | 説明 |
|---|---|---|
| `slotIndex` | `number` | 0〜5 のタブ番号 |
| `pokemonId` | `number \| null` | 全国図鑑番号。null = 空枠 |
| `nature` | `string` | 性格（英語名） |
| `statPoints` | `StatPoints` | 能力ポイント（各 0〜32、合計 ≤ 66） |
| `abilityNameEn` | `string` | 特性（英語名） |
| `itemNameEn` | `string` | 持ち物（英語名、空文字 = なし） |
| `boosts` | `StatBoosts` | ランク補正（各 −6〜＋6） |
| `moveNameEn` | `string` | わざ（英語名、空文字 = 未選択） |

### BuildName

- 1〜50 文字の文字列

### ShareToken

- URL-safe な文字列（`[a-zA-Z0-9_-]`）
- 16 文字以上
- 生成はサーバーサイドで行う（`crypto.randomBytes` 等）
- グローバルで一意
