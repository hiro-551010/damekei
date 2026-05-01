# ドメインモデル（damage-calc）

## 集約・Entity・ValueObject 一覧

```
Pokemon（集約ルート）
  ├── PokemonSpecies（ValueObject）
  ├── Nature（ValueObject）
  ├── StatPoints（ValueObject）  ← 能力ポイント（チャンピオンズ独自）
  ├── Ability（ValueObject）
  ├── Item（ValueObject）
  └── Move（ValueObject）  ← 使用するわざ（1つ）

DamageResult（ValueObject）
  ├── rolls: number[]         ← ダメージの 16 通りの乱数値
  ├── min: number
  ├── max: number
  └── percentages: number[]   ← 防御側最大 HP に対する割合（16 通り）
```

---

## Pokemon（集約ルート）

ダメージ計算の攻撃側・防御側どちらにも使う。

チャンピオンズではレベル 50・個体値 31 が固定のため、Pokemon モデルはそれらを保持しない。

| フィールド | 型 | 説明 |
|---|---|---|
| `species` | `PokemonSpecies` | 種族データ（種族値・タイプ等） |
| `nature` | `Nature` | 性格 |
| `statPoints` | `StatPoints` | 能力ポイント（各ステータス 0〜32、合計 ≤ 66） |
| `ability` | `Ability` | 特性 |
| `item` | `Item \| null` | 持ち物（なし可） |
| `boosts` | `StatBoosts` | ランク補正（−6〜＋6） |

---

## ValueObject 定義

### PokemonSpecies

PokeAPI から取得した種族データ。リポジトリから取得するのみで、ユーザーが直接生成しない。

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `number` | 全国図鑑番号 |
| `name` | `string` | 日本語名（PokeAPI `names` から取得） |
| `nameEn` | `string` | 英語名（`@smogon/calc` との照合に使用） |
| `types` | `PokemonType[]` | タイプ（1〜2 個） |
| `baseStats` | `BaseStats` | 種族値（HP / 攻撃 / 防御 / 特攻 / 特防 / 素早さ） |
| `abilities` | `string[]` | 持てる特性の一覧 |
| `learnableMoves` | `Move[]` | 覚えられるわざの一覧（infrastructure 層でIDを解決済み） |

### Nature

25 種の性格のうちの 1 つ。補正なし（無補正性格）5 種を含む。

上昇・下降ステータスのペアで定義する。

### StatPoints（能力ポイント）

チャンピオンズ独自の仕組み。従来の努力値（EVs）に相当するが単位・上限が異なる。
1 ポイント = 能力値 +1（性格補正なし時）。制約は `domain/rules.md` を参照。

| フィールド | 型 |
|---|---|
| `hp` | `number` |
| `attack` | `number` |
| `defense` | `number` |
| `spAttack` | `number` |
| `spDefense` | `number` |
| `speed` | `number` |

### StatBoosts

| フィールド | 型 | 説明 |
|---|---|---|
| `attack` | `number` | −6〜＋6 |
| `defense` | `number` | −6〜＋6 |
| `spAttack` | `number` | −6〜＋6 |
| `spDefense` | `number` | −6〜＋6 |
| `speed` | `number` | −6〜＋6 |

### Ability

| フィールド | 型 |
|---|---|
| `name` | `string` |
| `nameEn` | `string` |

### Item

| フィールド | 型 |
|---|---|
| `name` | `string` |
| `nameEn` | `string` |

### Move（使用するわざ）

計算に使用する 1 つのわざ。

| フィールド | 型 | 説明 |
|---|---|---|
| `name` | `string` | 日本語名 |
| `nameEn` | `string` | 英語名 |
| `power` | `number \| null` | 威力（変動わざは null） |
| `type` | `PokemonType` | わざタイプ |
| `category` | `MoveCategory` | `physical` / `special` / `status` |

### PokemonType

```
"normal" | "fire" | "water" | "electric" | "grass" | "ice"
| "fighting" | "poison" | "ground" | "flying" | "psychic"
| "bug" | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy"
```

### MoveCategory

```
"physical" | "special" | "status"
```

### BaseStats

| フィールド | 型 |
|---|---|
| `hp` | `number` |
| `attack` | `number` |
| `defense` | `number` |
| `spAttack` | `number` |
| `spDefense` | `number` |
| `speed` | `number` |

---

## DamageResult（ValueObject）

ダメージ計算の結果。`@smogon/calc` が返す乱数 16 通りをラップする。

| フィールド | 型 | 説明 |
|---|---|---|
| `rolls` | `number[]` | ダメージの 16 通りの乱数値（複数ヒット技はヒット合計値） |
| `hitCount` | `number` | 実際のヒット数（通常技は 1） |
| `min` | `number` | 最小ダメージ（`rolls[0]`） |
| `max` | `number` | 最大ダメージ（`rolls[15]`） |
| `percentages` | `number[]` | 防御側最大 HP に対する割合（小数第1位まで） |
| `minPercent` | `number` | 最小割合 |
| `maxPercent` | `number` | 最大割合 |
| `knockoutChance` | `KnockoutChance` | 確定・高確率・低確率・確定耐えの分類 |

### KnockoutChance

```
"guaranteed"       // 確定一発
| "high"           // 高乱数一発（rolls の過半数が KO）
| "low"            // 低乱数一発（rolls の一部が KO）
| "guaranteed_no"  // 確定耐え
```
