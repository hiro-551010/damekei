# DTOs（builds）

application 層と presentation 層の間でデータをやりとりする型定義。

---

## 入力 DTO

### StatPointsDto

努力値（EV）の6ステータス。値はそれぞれ 0〜32（実際のEVを31で割った値）。

| フィールド | 型 |
|---|---|
| `hp` | `number` |
| `attack` | `number` |
| `defense` | `number` |
| `spAttack` | `number` |
| `spDefense` | `number` |
| `speed` | `number` |

### StatBoostsDto

ランク補正（+6〜-6）。

| フィールド | 型 |
|---|---|
| `attack` | `number` |
| `defense` | `number` |
| `spAttack` | `number` |
| `spDefense` | `number` |
| `speed` | `number` |

### BuildSlotDto

構築の1スロット（ポケモン1体分）の入力データ。

| フィールド | 型 | 説明 |
|---|---|---|
| `slotIndex` | `number` | スロット番号（0〜5） |
| `pokemonId` | `number \| null` | ポケモンID。null は空スロット |
| `nature` | `string` | 性格（英語名、例: `"adamant"`） |
| `statPoints` | `StatPointsDto` | 努力値 |
| `abilityNameEn` | `string` | 特性名（英語） |
| `itemNameEn` | `string` | 持ち物名（英語）。なしは `""` |
| `boosts` | `StatBoostsDto` | ランク補正 |
| `moveNameEn` | `string` | 技名（英語） |

### SaveBuildInput

構築保存の入力。

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string \| undefined` | 既存構築のID。未指定なら新規作成 |
| `name` | `string` | 構築名（最大50文字） |
| `slots` | `BuildSlotDto[]` | スロット一覧（0〜6件） |

---

## 出力 DTO

### SaveBuildResult

保存完了後に返す最小情報。

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | 保存された構築のID |
| `shareToken` | `string` | 共有用トークン |

### BuildSummaryDto

構築一覧表示用の軽量DTO。

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | 構築ID |
| `name` | `string` | 構築名 |
| `shareToken` | `string` | 共有用トークン |
| `slotCount` | `number` | 入力済みスロット数 |
| `createdAt` | `string` | ISO 8601 形式 |
| `updatedAt` | `string` | ISO 8601 形式 |

### BuildDetailDto

構築詳細表示用のフルDTO。

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | 構築ID |
| `name` | `string` | 構築名 |
| `shareToken` | `string` | 共有用トークン |
| `slots` | `BuildSlotDto[]` | 6スロット分（空スロット含む） |
| `createdAt` | `string` | ISO 8601 形式 |
| `updatedAt` | `string` | ISO 8601 形式 |
