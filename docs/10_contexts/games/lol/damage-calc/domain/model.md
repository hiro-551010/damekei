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
| `passiveSpec` | `ChampionPassiveSpec \| undefined` | チャンピオン固有パッシブ（LoL Wiki 手動収集）|
| `stateModifiers` | `ChampionStateModifier[] \| undefined` | ステート変化（R 発動など）の定義 |
| `aaCritOverride` | `AACritOverride \| undefined` | AA クリット挙動のオーバーライド（Ashe 等）|

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
| `tier` | `number` | アイテムティア（1=スターター, 2=素材, 3=完成品, 4=特殊完成品） |
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
| `damageFormula` | `DamageFormula` | ダメージ計算式（式ツリー） |
| `variants` | `SkillVariantSpec[] \| undefined` | スキル内バリアント（スイートスポット等）|

> `damageFormula` は線形スケーリング（`add` / `mul` / `byRank` / `stat`）から HP% スケーリング
> まで任意の計算式を表現できる。Meraki のデータ変換は `fetch-lol-data.ts` の変換ロジックが担う。
> Meraki に "Total" / "Maximum" 属性がある場合はそれを優先し、ない場合は1ヒット分の値をそのまま使う。

### SkillVariantSpec

スキル内の追加ダメージバリアント（スイートスポット・別型ヒット等）。
バリアントは親スキルとは独立した計算式（`DamageFormula`）を持つ。

```typescript
type SkillVariantSpec = {
  name: string;
  formula: DamageFormula;  // 独立した計算式（乗数ではなく完全な式）
  damageType?: DamageType; // 省略時は親スキルと同じ型
};
```

> バリアントが親スキルと同じ計算式・同じダメージ種別の場合でも、明示的に `formula` を持つ。
> ダメージ種別だけ異なる場合は `damageType` を指定する（例: Ahri Q 復路 → `damageType: "true"`）。

### AACritOverride

AA のクリット挙動をチャンピオン固有にオーバーライドするための型。

```typescript
type AACritOverride = {
  alwaysCrit: boolean;    // true のとき critChance = 0 でもクリット行を表示する
  baseMultiplier: number; // 1.75 の代わりに使うクリット倍率（例: Ashe → 1.10）
};
```

> `bonusCritFactor`（IE 等の critDamageAmp パッシブ）は `baseMultiplier` に加算される。
> Ashe はクリットアイテムなしでも 1.10 倍、IE 装備（minCritChance 条件を満たす場合）で 1.10 + 0.35 = 1.45 倍になる。

### ChampionPassiveSpec

チャンピオン固有パッシブのダメージ定義。`DamageFormula` を使った汎用形。

```typescript
type ChampionPassiveSpec =
  | { kind: "onHitDamage"; formula: DamageFormula; damageType: DamageType }
```

> `onHitDamage` は AA ヒット時に発動するパッシブダメージを表す。
> `formula` に任意の `DamageFormula` を指定できる。
>
> 例: 最大HP% オンヒット（旧 `onHitMaxHpPercent`）は以下のように表現する:
> ```json
> {
>   "kind": "onHitDamage",
>   "formula": {
>     "kind": "mul",
>     "operands": [
>       { "kind": "stat", "ref": "defender.maxHp" },
>       { "kind": "byLevel", "values": [0.04, 0.04, ..., 0.10] }
>     ]
>   },
>   "damageType": "magic"
> }
> ```
>
> 数値の正本は LoL Wiki（`wiki.leagueoflegends.com`）。
> `champion-repository` がロード時に `champion-passives.json` からマージする（`item-passives.json` と同じ運用）。

### StatModifier

`ChampionStateModifier` で使用するステータス変化の定義。

```typescript
type StatModifier = {
  stat: StatRef;           // 変更するステータス
  addFormula: DamageFormula;  // 加算値の計算式
};
```

### ChampionStateModifier

アビリティ発動によるステータス変化の定義。

```typescript
type ChampionStateModifier = {
  name: string;
  triggerSlot: SkillSlot;
  statModifiers: StatModifier[];
};
```

> `triggerSlot` のスキルランクが 0（未習得）の場合は、対応するステート結果を非表示にする。
>
> 例: bonusAd を基礎AD比率で加算する場合（旧 `bonusAdFromBaseAd`）:
> ```json
> {
>   "name": "パッシブ名",
>   "triggerSlot": "R",
>   "statModifiers": [{
>     "stat": "attacker.bonusAd",
>     "addFormula": {
>       "kind": "mul",
>       "operands": [
>         { "kind": "stat", "ref": "attacker.baseAd" },
>         { "kind": "byRank", "values": [0.30, 0.45, 0.60, 0.75, 0.90] }
>       ]
>     }
>   }]
> }
> ```

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
| `moveSpeed` | `number` |

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
| `bonusArmor` | `number` | アイテム由来のアーマー（`armor - armor_at_level`） |
| `magicResist` | `number` | 総魔法耐性 |
| `bonusMagicResist` | `number` | アイテム由来のMR（`magicResist - mr_at_level`） |
| `hp` | `number` | 最大HP |
| `moveSpeed` | `number` | 移動速度（基礎移動速度 + アイテムボーナス） |
| `bonusMoveSpeed` | `number` | アイテム由来の移動速度 |
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
  onHitPhysicalPostMitigation: number | null;  // null = 物理オンヒットダメージなし（BotRK / Kraken / Spellblade）
  onHitPhysicalHpPercent: number | null;
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
> onHitPhysicalPostMitigation は物理オンヒット（BotRK・Kraken Slayer・Spellblade）の合算。計算機は満HP・Kraken3回目・スペルブレード常時発動を前提とする。

### SkillVariantResult

スキルバリアント（スイートスポット等）の計算結果。

```typescript
type SkillVariantResult = {
  name: string;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
};
```

### ChampionPassiveAAResult

チャンピオン固有パッシブ発動時の追加ダメージ。

```typescript
type ChampionPassiveAAResult = {
  damageType: DamageType;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
};
```

### ChampionStateResult

ステート変化（R 発動等）適用後の全スキル・AA 計算結果。

```typescript
type ChampionStateResult = {
  stateName: string;
  rank: number;
  autoAttack: AutoAttackResult;
  skills: SkillDamageResult[];
  championPassiveAA?: ChampionPassiveAAResult;
};
```

`DamageResult` は以下フィールドを追加する。

```typescript
type DamageResult = {
  autoAttack: AutoAttackResult;
  skills: SkillDamageResult[];
  championPassiveAA?: ChampionPassiveAAResult;  // チャンピオン固有パッシブ AA（例: Aatrox）
  stateResults?: ChampionStateResult[];          // R 発動中など（triggerSlot rank > 0 のみ）
};
```

`SkillDamageResult` は `variants` フィールドを追加する。

```typescript
type SkillDamageResult = {
  slot: SkillSlot;
  name: string;
  damageType: DamageType;
  preMitigation: number;
  effectiveResistance: number;
  postMitigation: number;
  reductionPercent: number;
  hpPercent: number;
  variants?: SkillVariantResult[];  // スイートスポット等
};
```
