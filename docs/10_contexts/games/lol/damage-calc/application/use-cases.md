# ユースケース（lol/damage-calc）

Phase 1 は内部 API なし。presentation 層のコンポーネントから直接呼び出す。

---

## クエリ一覧

| クエリ | 説明 |
|---|---|
| `GetChampionList` | 利用可能なチャンピオン一覧を返す |
| `GetChampionDetail` | 指定チャンピオンの詳細（スキル係数・基礎ステータス）を返す |
| `GetItemList` | 利用可能なアイテム一覧を返す |
| `CalculateDamage` | ダメージ値を計算して返す |

コマンド（状態変更）は Phase 1 では存在しない。

---

## GetChampionList

### 入力

なし（全件返す）

### 出力

```typescript
type ChampionListItemDto = {
  id: string;      // Meraki Analytics のチャンピオン ID
  name: string;    // 日本語名
  nameEn: string;  // 英語名
};
```

### 処理

1. `ChampionRepository.getAll()` を呼ぶ
2. ソート順：英語名昇順

---

## GetChampionDetail

指定チャンピオンの基礎ステータス・成長値・スキルダメージ係数を返す。
ユーザーがチャンピオン選択後にスキルやレベルを設定する際に使う。

### 入力

```typescript
type GetChampionDetailQuery = {
  championId: string;  // Meraki Analytics のチャンピオン ID
};
```

### 出力

```typescript
type ChampionDetailDto = {
  id: string;
  name: string;
  nameEn: string;
  baseStats: ChampionBaseStatsDto;
  statGrowth: ChampionStatGrowthDto;
  skills: SkillDamageSpecDto[];
};

type ChampionBaseStatsDto = {
  hp: number;
  ad: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
};

type ChampionStatGrowthDto = {
  hp: number;
  ad: number;
  armor: number;
  magicResist: number;
};

type SkillDamageSpecDto = {
  slot: "Q" | "W" | "E" | "R";
  name: string;
  damageType: "physical" | "magic" | "true";
  baseDamageByRank: number[];
  totalAdRatio: number;
  bonusAdRatio: number;
  apRatio: number;
};
```

### 処理

1. `ChampionRepository.getById(championId)` を呼ぶ
2. 見つからない場合は `NotFoundError` を throw

---

## GetItemList

### 入力

なし（全件返す）

### 出力

```typescript
type ItemListItemDto = {
  id: number;
  name: string;
  nameEn: string;
  stats: ItemStatsDto;
  passives: ItemPassiveDto[];
};

type ItemStatsDto = {
  ad: number | null;
  ap: number | null;
  armor: number | null;
  magicResist: number | null;
  hp: number | null;
  lethality: number | null;
  armorPenPercent: number | null;
  magicPenFlat: number | null;
  magicPenPercent: number | null;
  attackSpeed: number | null;
  critChance: number | null;
  lifeSteal: number | null;
  abilityHaste: number | null;
};

type ItemPassiveDto =
  | { kind: "armorPenPercent"; value: number }
  | { kind: "magicPenPercent"; value: number }
  | { kind: "bonusAdToAp"; ratio: number }
  | { kind: "other"; description: string };
```

### 処理

1. `ItemRepository.getAll()` を呼ぶ
2. ソート順：アイテム ID 昇順

---

## CalculateDamage

Q/W/E/R 全スキルのダメージを一括計算して返す。

### 入力

```typescript
type CalculateDamageQuery = {
  attacker: AttackerInputDto;
  defender: ChampionInputDto;
};

type AttackerInputDto = {
  championId: string;
  level: number;            // 1〜18
  itemIds: number[];        // 最大 6 個。順序は問わない
  skillAllocation: SkillAllocationDto;
};

type SkillAllocationDto = {
  q: number;  // 0〜5
  w: number;  // 0〜5
  e: number;  // 0〜5
  r: number;  // 0〜3
  // 合計 = attacker.level
  // R の制限: domain/rules.md の「スキルポイント振り分け」参照
};

type ChampionInputDto = {
  championId: string;
  level: number;       // 1〜18
  itemIds: number[];   // 最大 6 個。順序は問わない
};
```

### 出力

```typescript
type CalculateDamageResultDto = {
  skills: SkillDamageResultDto[];  // Q / W / E / R の順で 4 要素
};

type SkillDamageResultDto = {
  slot: "Q" | "W" | "E" | "R";
  skillName: string;
  rank: number;                    // 現在のランク（0 = 未習得）
  damageType: "physical" | "magic" | "true";
  preMitigationDamage: number;     // 未習得（rank=0）の場合は 0
  effectiveResistance: number;     // 貫通適用後の有効防御力 or 有効MR
  postMitigationDamage: number;    // 最終ダメージ（小数点以下切り捨て）
  damageReductionPercent: number;
  hpPercent: number;               // 防御側HPに対するダメージ割合（%）= postMitigationDamage / defenderHp × 100
};
```

### 処理

1. `ChampionRepository.getById()` で攻撃側・防御側チャンピオンを取得
2. `ItemRepository.getByIds()` で攻撃側・防御側のアイテムを取得
3. DTO → domain モデルに変換。domain のバリデーション（SkillAllocation の合計・R制限等）を通す
4. `StatsComputer.compute(attacker)` で攻撃側の `ComputedStats` を生成
5. `StatsComputer.compute(defender)` で防御側の `ComputedStats` を生成
6. Q/W/E/R の各スキルに対して `DamageCalculator.calculate(attackerStats, defenderStats, skill, rank)` を呼ぶ（rank=0 の場合は結果を 0 として返す）
7. 結果を `CalculateDamageResultDto` に変換して返す

### エラー

| 条件 | エラー |
|---|---|
| `championId` が存在しない | `NotFoundError` |
| `itemIds` に存在しないIDが含まれる | `NotFoundError` |
| `level` が範囲外（1〜18以外） | `DomainError` |
| `skillAllocation` の合計が `level` と不一致 | `DomainError` |
| R ランクがチャンピオンレベルに対して過大 | `DomainError` |
| `itemIds` が 7 個以上 | `DomainError` |
| `itemIds` に重複がある | `DomainError` |
