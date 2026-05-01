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
  champions.json    # 全チャンピオンの基礎ステータス・成長値・スキル係数
  items.json        # 全アイテムのステータス・パッシブ効果
```

---

## champions.json

全チャンピオンのデータ。

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
        "baseDamageByRank": [40, 65, 90, 115, 140],
        "totalAdRatio": 0,
        "bonusAdRatio": 0,
        "apRatio": 0.35
      },
      {
        "slot": "W",
        "name": "フォックスファイア",
        "damageType": "magic",
        "baseDamageByRank": [60, 90, 120, 150, 180],
        "totalAdRatio": 0,
        "bonusAdRatio": 0,
        "apRatio": 0.4
      },
      {
        "slot": "E",
        "name": "チャーム",
        "damageType": "magic",
        "baseDamageByRank": [60, 90, 120, 150, 180],
        "totalAdRatio": 0,
        "bonusAdRatio": 0,
        "apRatio": 0.5
      },
      {
        "slot": "R",
        "name": "スピリット・ラッシュ",
        "damageType": "magic",
        "baseDamageByRank": [200, 300, 400],
        "totalAdRatio": 0,
        "bonusAdRatio": 0,
        "apRatio": 0.3
      }
    ]
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | Meraki Analytics のチャンピオン ID（英語、スペースなし） |
| `name` | `string` | 日本語名 |
| `nameEn` | `string` | 英語名 |
| `baseStats` | `object` | レベル1時の基礎ステータス |
| `statGrowth` | `object` | レベルアップごとの成長値 |
| `skills` | `object[]` | Q/W/E/R のダメージ係数（スコープ外スキルは含まない） |
| `skills[].baseDamageByRank` | `number[]` | ランク1〜5（Rは1〜3）の基礎ダメージ |
| `skills[].totalAdRatio` | `number` | 総AD に対する係数（0 = スケールなし） |
| `skills[].bonusAdRatio` | `number` | ボーナスAD に対する係数 |
| `skills[].apRatio` | `number` | AP に対する係数 |

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
| `name` | `string` | 日本語名 |
| `nameEn` | `string` | 英語名 |
| `stats` | `object` | 付与ステータス（該当なしは `null`） |
| `passives` | `object[]` | ダメージ計算に影響するパッシブ（`domain/model.md` の `ItemPassive` 参照） |

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
