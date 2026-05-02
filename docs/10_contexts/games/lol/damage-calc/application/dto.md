# DTOs（lol/damage-calc）

application 層と presentation 層の間でデータをやりとりする型定義。
ユースケースの入出力仕様は `application/use-cases.md` を参照。

---

## チャンピオン関連

### ChampionSummaryDto

一覧表示用の軽量DTO。

| フィールド | 型 |
|---|---|
| `id` | `string` |
| `name` | `string` |
| `nameEn` | `string` |

### ChampionDetailDto

チャンピオン選択後の詳細情報。

| フィールド | 型 |
|---|---|
| `id` | `string` |
| `name` | `string` |
| `nameEn` | `string` |
| `baseStats` | `{ hp, ad, armor, magicResist, attackSpeed: number }` |
| `statGrowth` | `{ hp, ad, armor, magicResist: number }` |
| `skills` | `SkillDamageSpecDto[]` |

### SkillDamageSpecDto

スキルのダメージ係数（表示・入力用）。

| フィールド | 型 |
|---|---|
| `slot` | `SkillSlot` |
| `name` | `string` |
| `damageType` | `DamageType` |
| `baseDamageByRank` | `number[]` |
| `totalAdRatio` | `number` |
| `bonusAdRatio` | `number` |
| `apRatio` | `number` |

---

## アイテム関連

### ItemDto

| フィールド | 型 |
|---|---|
| `id` | `number` |
| `name` | `string` |
| `nameEn` | `string` |
| `stats` | `{ ad, ap, armor, magicResist, hp, lethality, armorPenPercent, magicPenFlat, magicPenPercent, attackSpeed, critChance, lifeSteal, abilityHaste: number \| null }` |

---

## ダメージ計算 入力 DTO

### SkillAllocationDto

| フィールド | 型 | 説明 |
|---|---|---|
| `q` | `number` | 0〜5 |
| `w` | `number` | 0〜5 |
| `e` | `number` | 0〜5 |
| `r` | `number` | 0〜3 |

### AttackerInputDto

| フィールド | 型 |
|---|---|
| `championId` | `string` |
| `level` | `number` |
| `itemIds` | `number[]` |
| `skillAllocation` | `SkillAllocationDto` |

### DefenderInputDto

| フィールド | 型 |
|---|---|
| `championId` | `string` |
| `level` | `number` |
| `itemIds` | `number[]` |

---

## ダメージ計算 出力 DTO

### SkillDamageResultDto

1スキル分の計算結果。

| フィールド | 型 | 説明 |
|---|---|---|
| `slot` | `SkillSlot` | Q / W / E / R |
| `name` | `string` | スキル名 |
| `damageType` | `DamageType` | ダメージ種別 |
| `preMitigation` | `number` | 軽減前ダメージ |
| `effectiveResistance` | `number` | 貫通適用後の有効防御力 |
| `postMitigation` | `number` | 最終ダメージ（小数点以下四捨五入） |
| `reductionPercent` | `number` | 軽減率（%） |
| `hpPercent` | `number` | 防御側HP比ダメージ（%） |

### CalculateDamageResultDto

| フィールド | 型 |
|---|---|
| `skills` | `SkillDamageResultDto[]` |
