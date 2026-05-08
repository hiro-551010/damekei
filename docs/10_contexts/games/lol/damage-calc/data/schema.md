# データスキーマ（lol/damage-calc）

Phase 1 は DB なし。Meraki Analytics から取得した静的 JSON をローカルに生成して使う。
JSON は git 管理外（`.gitignore`）。`scripts/fetch-lol-data.ts` で生成する。

---

## データソース

| データ | 取得元 | URL |
|---|---|---|
| チャンピオンデータ | Meraki Analytics | `https://cdn.merakianalytics.com/riot/lol/resources/latest/ja_JP/champions.json` |
| アイテムデータ | Meraki Analytics | `https://cdn.merakianalytics.com/riot/lol/resources/latest/ja_JP/items.json` |

> Meraki Analytics は Data Dragon より精度が高く、Lethality・魔法貫通・スキルダメージ係数を正確に提供する。
> パッチ更新時は `scripts/fetch-lol-data.ts` を再実行することでデータを更新する。

---

## 静的 JSON の配置

```
app/src/contexts/games/lol/damage-calc/infrastructure/data/
  champions.json          # 全チャンピオンの基礎ステータス・成長値・スキル係数（gitignore）
  items.json              # 全アイテムのステータス・パッシブ効果（gitignore）
  item-passives.json      # アイテムパッシブ手動収集データ（git管理）
  champion-passives.json  # チャンピオン固有パッシブ手動収集データ（git管理）
```

---

## champions.json

全チャンピオンのデータ。スキルは `DamageFormula` 形式の式ツリーで格納する。

```json
[
  {
    "id": "Ahri",
    "name": "アーリ",
    "nameEn": "Ahri",
    "baseStats": {
      "hp": 590,
      "ad": 53,
      "armor": 21,
      "magicResist": 30,
      "attackSpeed": 0.668
    },
    "statGrowth": {
      "hp": 96,
      "ad": 3,
      "armor": 4.2,
      "magicResist": 1.3
    },
    "skills": [
      {
        "slot": "Q",
        "name": "オーブ・オブ・デセプション",
        "damageType": "magic",
        "damageFormula": {
          "kind": "add",
          "operands": [
            { "kind": "byRank", "values": [40, 65, 90, 115, 140] },
            { "kind": "mul", "operands": [
              { "kind": "stat", "ref": "attacker.ap" },
              { "kind": "const", "value": 0.35 }
            ]}
          ]
        }
      },
      {
        "slot": "W",
        "name": "フォックスファイア",
        "damageType": "magic",
        "damageFormula": {
          "kind": "add",
          "operands": [
            { "kind": "byRank", "values": [60, 90, 120, 150, 180] },
            { "kind": "mul", "operands": [
              { "kind": "stat", "ref": "attacker.ap" },
              { "kind": "const", "value": 0.4 }
            ]}
          ]
        }
      },
      {
        "slot": "E",
        "name": "チャーム",
        "damageType": "magic",
        "damageFormula": {
          "kind": "add",
          "operands": [
            { "kind": "byRank", "values": [60, 90, 120, 150, 180] },
            { "kind": "mul", "operands": [
              { "kind": "stat", "ref": "attacker.ap" },
              { "kind": "const", "value": 0.5 }
            ]}
          ]
        }
      },
      {
        "slot": "R",
        "name": "スピリット・ラッシュ",
        "damageType": "magic",
        "damageFormula": {
          "kind": "add",
          "operands": [
            { "kind": "byRank", "values": [200, 300, 400] },
            { "kind": "mul", "operands": [
              { "kind": "stat", "ref": "attacker.ap" },
              { "kind": "const", "value": 0.3 }
            ]}
          ]
        }
      }
    ]
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | Meraki Analytics のチャンピオン ID（英語、スペースなし） |
| `name` | `string` | 英語名（Meraki から取得。`nameEn` と同値） |
| `nameEn` | `string` | 英語名 |
| `baseStats` | `object` | レベル1時の基礎ステータス |
| `statGrowth` | `object` | レベルアップごとの成長値 |
| `skills` | `object[]` | Q/W/E/R のダメージ係数（スコープ外スキルは含まない） |
| `skills[].damageFormula` | `DamageFormula` | ダメージ計算式（式ツリー。`domain/types.md` 参照） |

### Ahri Q 復路バリアント（SkillVariantSpec の formula 使用例）

`champion-passives.json` に以下のように記述する。バリアントは独立した `formula` を持つ。

```json
{
  "Ahri": {
    "skillVariants": {
      "Q": [{
        "name": "Q（復路：真のダメージ）",
        "formula": {
          "kind": "add",
          "operands": [
            { "kind": "byRank", "values": [40, 65, 90, 115, 140] },
            { "kind": "mul", "operands": [
              { "kind": "stat", "ref": "attacker.ap" },
              { "kind": "const", "value": 0.35 }
            ]}
          ]
        },
        "damageType": "true"
      }]
    }
  }
}
```

---

## items.json

全アイテムのデータ。購入可能アイテム（コンポーネント除く）を対象とする。

```json
[
  {
    "id": 3031,
    "name": "インフィニティ・エッジ",
    "nameEn": "Infinity Edge",
    "stats": {
      "ad": 70,
      "ap": null,
      "armor": null,
      "magicResist": null,
      "hp": null,
      "lethality": null,
      "armorPenPercent": null,
      "magicPenFlat": null,
      "magicPenPercent": null,
      "attackSpeed": null,
      "critChance": 20,
      "lifeSteal": null,
      "abilityHaste": null
    },
    "passives": []
  },
  {
    "id": 3035,
    "name": "ラスト・ウィスパー",
    "nameEn": "Last Whisper",
    "stats": {
      "ad": 20,
      "ap": null,
      "armor": null,
      "magicResist": null,
      "hp": null,
      "lethality": null,
      "armorPenPercent": null,
      "magicPenFlat": null,
      "magicPenPercent": null,
      "attackSpeed": null,
      "critChance": null,
      "lifeSteal": null,
      "abilityHaste": null
    },
    "passives": [
      { "kind": "armorPenPercent", "value": 30 }
    ]
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `number` | Riot ゲームのアイテム ID |
| `name` | `string` | 英語名（Meraki から取得。`nameEn` と同値） |
| `nameEn` | `string` | 英語名 |
| `stats` | `object` | 付与ステータス（該当なしは `null`） |
| `passives` | `object[]` | ダメージ計算に影響するパッシブ（`domain/model.md` の `ItemPassive` 参照） |

---

## champion-passives.json

チャンピオン固有パッシブ・スキルバリアント・ステート変化の手動収集データ。git 管理。
`item-passives.json` と同じ運用：`champions.json` はスクリプト生成で gitignore されており、
`champion-repository` がロード時に `champion-passives.json` をマージする。

```json
{
  "<ChampionId>": {
    "passiveSpec": { ... },
    "skillVariants": {
      "Q": [ { "name": "...", "formula": { ... }, "damageType": "true" } ]
    },
    "stateModifiers": [ { ... } ]
  }
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `passiveSpec` | `object` | チャンピオン固有パッシブ（型は `domain/model.md` の `ChampionPassiveSpec` 参照） |
| `skillVariants` | `object` | スロット → `SkillVariantSpec[]`。`champion-repository` がスキルにマージ |
| `stateModifiers` | `object[]` | R 発動等のステート変化（型は `domain/model.md` の `ChampionStateModifier` 参照） |

### Aatrox のパッシブ（onHitDamage 使用例）

```json
{
  "Aatrox": {
    "passiveSpec": {
      "kind": "onHitDamage",
      "formula": {
        "kind": "mul",
        "operands": [
          { "kind": "stat", "ref": "defender.maxHp" },
          { "kind": "byLevel", "values": [0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.05, 0.05, 0.06, 0.06, 0.06, 0.07, 0.07, 0.07, 0.10] }
        ]
      },
      "damageType": "magic"
    }
  }
}
```

> 各チャンピオンの具体的なデータは `docs/10_contexts/games/lol/damage-calc/data/champions/<id>.md` を参照。
> 数値の正本は LoL Wiki（`wiki.leagueoflegends.com`）。

---

## マイグレーション戦略（既存データの自動変換）

`fetch-lol-data.ts` の変換ロジックが Meraki の線形スケーリングを `DamageFormula` の `add/mul` ノードに変換する。

### パターン1: 全スケーリングがゼロ（baseDamage のみ）

```json
// 変換前（旧スキーマ）
{ "baseDamageByRank": [100, 150, 200, 250, 300], "totalAdRatioByRank": [0,0,0,0,0], ... }

// 変換後（新スキーマ）
{ "damageFormula": { "kind": "byRank", "values": [100, 150, 200, 250, 300] } }
```

### パターン2: baseDamage + 単一スケーリング（add + mul）

```json
// 変換前（旧スキーマ）
{ "baseDamageByRank": [40, 65, 90, 115, 140], "apRatioByRank": [0.35, 0.35, 0.35, 0.35, 0.35], ... }

// 変換後（新スキーマ）
{
  "damageFormula": {
    "kind": "add",
    "operands": [
      { "kind": "byRank", "values": [40, 65, 90, 115, 140] },
      { "kind": "mul", "operands": [
        { "kind": "stat", "ref": "attacker.ap" },
        { "kind": "byRank", "values": [0.35, 0.35, 0.35, 0.35, 0.35] }
      ]}
    ]
  }
}
```

`byRank` の全要素が同じ場合（固定係数）は `const` に圧縮する:
```json
{ "kind": "mul", "operands": [
  { "kind": "stat", "ref": "attacker.ap" },
  { "kind": "const", "value": 0.35 }
]}
```

### パターン3: 複数スケーリング（add の operands に複数の mul）

```json
// 変換前（旧スキーマ）
{ "baseDamageByRank": [10,30,50,70,90], "totalAdRatioByRank": [0.6,0.7,0.8,0.9,1.0], "apRatioByRank": [0.3,0.3,0.3,0.3,0.3] }

// 変換後（新スキーマ）
{
  "damageFormula": {
    "kind": "add",
    "operands": [
      { "kind": "byRank", "values": [10, 30, 50, 70, 90] },
      { "kind": "mul", "operands": [
        { "kind": "stat", "ref": "attacker.totalAd" },
        { "kind": "byRank", "values": [0.6, 0.7, 0.8, 0.9, 1.0] }
      ]},
      { "kind": "mul", "operands": [
        { "kind": "stat", "ref": "attacker.ap" },
        { "kind": "const", "value": 0.3 }
      ]}
    ]
  }
}
```

---

## サンプル検証（新スキーマ）

以下のチャンピオンを例示して新スキーマの表現力を検証する。

### Aatrox Q（線形: base + totalAd）

```json
{
  "slot": "Q",
  "name": "ダーキン・ブレード",
  "damageType": "physical",
  "damageFormula": {
    "kind": "add",
    "operands": [
      { "kind": "byRank", "values": [10, 30, 50, 70, 90] },
      { "kind": "mul", "operands": [
        { "kind": "stat", "ref": "attacker.totalAd" },
        { "kind": "byRank", "values": [0.6, 0.7, 0.8, 0.9, 1.0] }
      ]}
    ]
  }
}
```

### Vayne W（最大HP% 真のダメージ）

Vayne W は AA パッシブではなくスキルとしてモデル化する。`damageType: "true"` を設定。

```json
{
  "slot": "W",
  "name": "シルバー・ボルト",
  "damageType": "true",
  "damageFormula": {
    "kind": "mul",
    "operands": [
      { "kind": "stat", "ref": "defender.maxHp" },
      { "kind": "byRank", "values": [0.04, 0.055, 0.07, 0.085, 0.10] }
    ]
  }
}
```

> フェーズ1時点ではスキーマ定義のみ。実データへの適用はフェーズ3で実施する（データ収集が必要）。

### Anivia R（DoT 1秒あたり: base + ap）

```json
{
  "slot": "R",
  "name": "グレイシャル・ストーム（1秒あたり）",
  "damageType": "magic",
  "damageFormula": {
    "kind": "add",
    "operands": [
      { "kind": "byRank", "values": [60, 85, 110] },
      { "kind": "mul", "operands": [
        { "kind": "stat", "ref": "attacker.ap" },
        { "kind": "const", "value": 0.25 }
      ]}
    ]
  }
}
```

---

## データ更新手順

パッチ更新時のみ実行する。

```bash
# Meraki Analytics から最新データを取得・変換
pnpm run fetch-lol-data

# 差分を確認してコミット
git diff app/src/contexts/games/lol/damage-calc/infrastructure/data/
git add app/src/contexts/games/lol/damage-calc/infrastructure/data/
git commit -m "chore(lol/damage-calc): チャンピオン・アイテムデータを更新"
```

スクリプトの詳細は `scripts/fetch-lol-data.ts` を参照。
