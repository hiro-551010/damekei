# ドメインモデル（lol/damage-calc）

## 集約・Entity・ValueObject 一覧

```
Champion（集約ルート）
  ├── ChampionSpecies（ValueObject）  ← 基礎ステータス・成長値・スキル係数
  ├── Level（ValueObject）            ← 1〜18
  └── Build（ValueObject）            ← 装備アイテム（最大 6 個）
        └── Item[]（ValueObject）

SkillAllocation（ValueObject）        ← Q/W/E/R へのスキルポイント振り分け
  ├── q: number                       ← ランク 0〜5
  ├── w: number                       ← ランク 0〜5
  ├── e: number                       ← ランク 0〜5
  └── r: number                       ← ランク 0〜3

ComputedStats（ValueObject）          ← Champion から導出した最終ステータス
DamageResult（ValueObject）           ← Q/W/E/R それぞれの計算結果
```

---

## Champion（集約ルート）

ダメージ計算の攻撃側・防御側どちらにも使う。

| フィールド | 型 | 説明 |
|---|---|---|
| `species` | `ChampionSpecies` | チャンピオン種族データ |
| `level` | `Level` | チャンピオンレベル（1〜18） |
| `build` | `Build` | 装備アイテム（0〜6個） |

---

## ValueObject 定義

### ChampionSpecies

Meraki Analytics から取得した種族データ。リポジトリから取得するのみで、ユーザーが直接生成しない。

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | Meraki Analytics のチャンピオン ID（例: `"Ahri"`） |
| `name` | `string` | 日本語名（例: `"アーリ"`） |
| `nameEn` | `string` | 英語名 |
| `baseStats` | `ChampionBaseStats` | レベル1時の基礎ステータス |
| `statGrowth` | `ChampionStatGrowth` | レベルアップごとの成長値 |
| `skills` | `SkillDamageSpec[]` | Q/W/E/R のダメージ係数一覧 |

### Level

| 制約 | 値 |
|---|---|
| 範囲 | 1〜18 |

### Build

| フィールド | 型 | 説明 |
|---|---|---|
| `items` | `Item[]` | 装備アイテム（最大 6 個） |

### Item

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `number` | Meraki Analytics のアイテム ID |
| `name` | `string` | 日本語名 |
| `nameEn` | `string` | 英語名 |
| `stats` | `ItemStats` | 付与ステータス |
| `passives` | `ItemPassive[]` | ダメージ計算に影響するパッシブ効果（空配列可） |

### ItemStats

アイテムが付与するステータス。null はそのアイテムに該当ステータスがないことを示す。

| フィールド | 型 | 説明 |
|---|---|---|
| `ad` | `number \| null` | 攻撃力（Attack Damage） |
| `ap` | `number \| null` | 魔力（Ability Power） |
| `armor` | `number \| null` | 防御力 |
| `magicResist` | `number \| null` | 魔法耐性（MR） |
| `hp` | `number \| null` | 最大HP |
| `lethality` | `number \| null` | 物理貫通（固定値。防御力を直接減少させる） |
| `armorPenPercent` | `number \| null` | 物理貫通（%。0〜100） |
| `magicPenFlat` | `number \| null` | 魔法貫通（固定値） |
| `magicPenPercent` | `number \| null` | 魔法貫通（%。0〜100） |
| `attackSpeed` | `number \| null` | 攻撃速度ボーナス（%） |
| `critChance` | `number \| null` | クリティカル率（%） |
| `lifeSteal` | `number \| null` | ライフスティール（%） |
| `abilityHaste` | `number \| null` | アビリティヘイスト |

### ItemPassive

ダメージ計算に影響するパッシブ効果を型で分類する。

```typescript
type ItemPassive =
  | { kind: "armorPenPercent"; value: number }
    // 例: Last Whisper系（物理貫通%）。ItemStats にない場合のみ使用
  | { kind: "magicPenPercent"; value: number }
    // 例: Void Staff（魔法貫通%）。ItemStats にない場合のみ使用
  | { kind: "critDamageAmp"; bonusFactor: number; minCritChance: number }
    // クリットダメージ倍率の加算。critChance >= minCritChance のとき有効。
    // 例: Infinity Edge → bonusFactor: 0.35, minCritChance: 40
    //     通常 1.75 倍 → 1.75 + 0.35 = 2.10 倍
  | { kind: "onHitMagicDamage"; damage: number }
    // AA ヒット時のフラット魔法ダメージ（常時発動前提）。
    // 例: Statikk Shiv → damage: 60 / Wit's End → damage: 45
    // 攻撃側の magicPenFlat / magicPenPercent を適用し、防御側 MR で軽減する
  | { kind: "onHitMagicDamageScaled"; base: number; apRatio: number }
    // フラット + AP比率のオンヒット魔法ダメージ（常時発動前提）。
    // 例: Nashor's Tooth → base: 15, apRatio: 0.15
  | { kind: "apAmp"; ratio: number }
    // 総APを (1 + ratio) 倍する（stats-computer で適用）。
    // 例: Rabadon's Deathcap → ratio: 0.30
  | { kind: "onHitPhysicalCurrentHpPercent"; percent: number }
    // 現在HP% の物理オンヒット。計算機は満HP前提で計算する。
    // 例: Blade of the Ruined King → percent: 9（メレー値）
  | { kind: "nthHitPhysical"; hitCount: number; minDamage: number; maxDamage: number }
    // N回目のAAで発動する物理ダメージ。攻撃側レベル1→18 で minDamage→maxDamage 線形補間。
    // 例: Kraken Slayer → hitCount: 3, minDamage: 150, maxDamage: 210
  | { kind: "spellblade"; baseAdRatio: number }
    // アビリティ使用後の次のAA（常時発動前提）で基礎AD比率の物理ダメージを付与。
    // 例: Trinity Force → baseAdRatio: 2.0
  | { kind: "bonusAdToAp"; ratio: number }
    // ボーナスADをAPに変換するパッシブ
  | { kind: "other"; description: string }
    // 計算対象外の複雑なパッシブ（表示のみ）
```

> `armorPenPercent` / `magicPenPercent` は `ItemStats` にも存在するが、アイテムによっては
> ステータスではなくパッシブとして実装されているため、両方を確認して合算する。

> パッシブ数値の正本は `infrastructure/data/item-passives.json`（git 管理）。
> `items.json` はスクリプト生成で gitignore されており、`passives` フィールドは常に空配列。
> `item-repository` がロード時に `item-passives.json` をマージする。

### SkillSlot

```
"Q" | "W" | "E" | "R"
```

### SkillDamageSpec

Meraki Analytics から取得したスキルのダメージ係数。多段ヒットは Meraki の "Total" / "Maximum" 属性を使い合計値として格納する。

| フィールド | 型 | 説明 |
|---|---|---|
| `slot` | `SkillSlot` | Q / W / E / R |
| `name` | `string` | スキル名 |
| `damageType` | `DamageType` | ダメージ種別 |
| `baseDamageByRank` | `number[]` | ランク別基礎ダメージ合計（rank 1〜5、Rは1〜3） |
| `totalAdRatioByRank` | `number[]` | ランク別・総AD スケーリング係数 |
| `bonusAdRatioByRank` | `number[]` | ランク別・ボーナスAD スケーリング係数 |
| `apRatioByRank` | `number[]` | ランク別・AP スケーリング係数 |

> ランク別配列の例: `bonusAdRatioByRank: [1.20, 1.45, 1.70, 1.95, 2.20]` = ランク1で120%、ランク5で220%。
> 固定値のスキルは全要素が同じ値の配列になる（例: `[0.4, 0.4, 0.4, 0.4, 0.4]`）。
> Meraki に "Total" / "Maximum" 属性がある場合はそれを優先し、ない場合は1ヒット分の値をそのまま使う。

### DamageType

```
"physical" | "magic" | "true"
```

### ChampionBaseStats

レベル1時のチャンピオン基礎ステータス。

| フィールド | 型 |
|---|---|
| `hp` | `number` |
| `ad` | `number` |
| `armor` | `number` |
| `magicResist` | `number` |
| `attackSpeed` | `number` |

### ChampionStatGrowth

レベルアップごとの成長値（Meraki Analytics の `growthperlevel` に相当）。

| フィールド | 型 |
|---|---|
| `hp` | `number` |
| `ad` | `number` |
| `armor` | `number` |
| `magicResist` | `number` |

---

## ComputedStats（ValueObject）

`Champion`（species + level + build）から計算した最終ステータス。

| フィールド | 型 | 説明 |
|---|---|---|
| `totalAd` | `number` | 総攻撃力（基礎AD + ボーナスAD） |
| `bonusAd` | `number` | ボーナスAD（アイテム由来のみ） |
| `ap` | `number` | 魔力 |
| `armor` | `number` | 総防御力 |
| `magicResist` | `number` | 総魔法耐性 |
| `hp` | `number` | 最大HP |
| `lethality` | `number` | 総Lethality |
| `armorPenPercent` | `number` | 総物理貫通%（0〜100） |
| `magicPenFlat` | `number` | 総魔法貫通（固定値） |
| `magicPenPercent` | `number` | 総魔法貫通%（0〜100） |
| `critChance` | `number` | クリティカル率（%。0〜100。アイテム由来） |

`ComputedStats` は `Champion` から導出されるため、domain サービス `StatsComputer` が計算する。

---

## SkillAllocation（ValueObject）

攻撃側チャンピオンの Q/W/E/R へのスキルポイント振り分け。

| フィールド | 型 | 説明 |
|---|---|---|
| `q` | `number` | Q のランク（0〜5。0 = 未習得） |
| `w` | `number` | W のランク（0〜5。0 = 未習得） |
| `e` | `number` | E のランク（0〜5。0 = 未習得） |
| `r` | `number` | R のランク（0〜3。0 = 未習得） |

不変条件は `domain/rules.md` の「スキルポイント振り分け」を参照。

---

## DamageResult（ValueObject）

Q/W/E/R 全スキルおよびオートアタックの計算結果をまとめたもの。

```typescript
type DamageResult = {
  autoAttack: AutoAttackResult;
  skills: SkillDamageResult[];  // Q/W/E/R 順（未習得スキルも含む）
};

type AutoAttackResult = {
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
  critPostMitigation: number | null;  // null = 攻撃側にクリティカル率 0（クリティカルアイテムなし）
  critHpPercent: number | null;
  onHitMagicPostMitigation: number | null;  // null = オンヒット魔法ダメージなし
  onHitMagicHpPercent: number | null;
};

type SkillDamageResult = {
  slot: SkillSlot;
  skillName: string;
  rank: number;                    // 現在のランク（0 = 未習得）
  damageType: DamageType;
  preMitigationDamage: number;     // 未習得の場合は 0
  effectiveResistance: number;     // 貫通適用後の有効防御力 or 有効MR（真のダメージは 0）
  postMitigationDamage: number;    // 最終ダメージ（小数点以下切り捨て）
  damageReductionPercent: number;  // 耐性による軽減率（%）
  hpPercent: number;               // 防御側HPに対するダメージ割合（%）= postMitigationDamage / defenderHp × 100
};
```

> オートアタック: preMitigation = totalAd（物理ダメージ）。クリティカルは totalAd × 1.75。
> critPostMitigation は攻撃側の critChance が 0 のとき null とし、表示側でハイフンを出す。
