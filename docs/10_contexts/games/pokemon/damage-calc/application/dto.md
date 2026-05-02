# DTOs（pokemon/damage-calc）

application 層と presentation 層の間でデータをやりとりする型定義。
ユースケースの入出力仕様は `application/use-cases.md` を参照。

---

## ポケモンデータ関連

### BaseStatsDto

基礎ステータス（種族値）。

| フィールド | 型 |
|---|---|
| `hp` / `attack` / `defense` / `spAttack` / `spDefense` / `speed` | `number` |

### PokemonListItemDto

一覧表示用の軽量DTO。

| フィールド | 型 |
|---|---|
| `id` | `number` |
| `name` | `string` |
| `nameEn` | `string` |
| `types` | `PokemonType[]` |
| `baseStats` | `BaseStatsDto` |

### AbilityDto

| フィールド | 型 |
|---|---|
| `name` | `string` |
| `nameEn` | `string` |

### MoveDto

| フィールド | 型 |
|---|---|
| `id` | `number` |
| `name` | `string` |
| `nameEn` | `string` |
| `power` | `number \| null` |
| `type` | `PokemonType` |
| `category` | `MoveCategory` |

### PokemonDetailDto

ポケモン選択後の詳細情報。

| フィールド | 型 |
|---|---|
| `id` | `number` |
| `name` | `string` |
| `nameEn` | `string` |
| `types` | `PokemonType[]` |
| `baseStats` | `BaseStatsDto` |
| `abilities` | `AbilityDto[]` |
| `moves` | `MoveDto[]` |

---

## ダメージ計算 入力 DTO

### StatPointsDto

努力値（EV）。各値は 0〜32（実際のEVを31で割った値）。

| フィールド | 型 |
|---|---|
| `hp` / `attack` / `defense` / `spAttack` / `spDefense` / `speed` | `number` |

### StatBoostsDto

ランク補正（+6〜-6）。

| フィールド | 型 |
|---|---|
| `attack` / `defense` / `spAttack` / `spDefense` / `speed` | `number` |

### PokemonInputDto

計算に使うポケモン1体の入力。

| フィールド | 型 | 説明 |
|---|---|---|
| `pokemonId` | `number` | ポケモンID |
| `nature` | `string` | 性格（英語名） |
| `statPoints` | `StatPointsDto` | 努力値 |
| `abilityNameEn` | `string` | 特性名（英語） |
| `itemNameEn` | `string \| null` | 持ち物名（英語）。なしは `null` |
| `boosts` | `StatBoostsDto` | ランク補正 |

### CalculateDamageQuery

ダメージ計算の入力。

| フィールド | 型 | 説明 |
|---|---|---|
| `attacker` | `PokemonInputDto` | 攻撃側 |
| `defender` | `PokemonInputDto` | 防御側 |
| `moveNameEn` | `string` | 技名（英語） |
| `hitCount` | `number \| undefined` | 複数回ヒット技の回数（省略時は技のデフォルト） |
| `field` | `{ weather?, terrain? } \| undefined` | フィールド状態 |

`field.weather`: `"sun" | "rain" | "sand" | "snow" | null`

`field.terrain`: `"electric" | "grassy" | "misty" | "psychic" | null`

---

## ダメージ計算 出力 DTO

### DamageResultDto

| フィールド | 型 | 説明 |
|---|---|---|
| `rolls` | `number[]` | 16通りのダメージロール |
| `hitCount` | `number` | 実際に計算したヒット回数 |
| `min` | `number` | 最小ダメージ |
| `max` | `number` | 最大ダメージ |
| `percentages` | `number[]` | 防御側HP比ダメージ（%）の16通り |
| `minPercent` | `number` | 最小HP比（%） |
| `maxPercent` | `number` | 最大HP比（%） |
| `knockoutChance` | `KnockoutChance` | 確定1発・高確率・低確率・確定耐え |
