# データスキーマ（damage-calc）

Phase 1 は DB なし。PokeAPI から取得した静的 JSON をローカルに生成して使う。JSON は git 管理外（`.gitignore`）。`scripts/fetch-pokemon-data.ts` で生成する。

---

## 静的 JSON の配置

```
app/src/contexts/games/pokemon/damage-calc/infrastructure/data/
  pokemon.json    # ポケモン種族データ（278種）
  moves.json      # わざデータ
  items.json      # 持ち物データ
  abilities.json  # 特性データ
```

---

## pokemon.json

チャンピオンズに登場する 278 種のポケモンデータ。

```json
[
  {
    "id": 6,
    "name": "リザードン",
    "nameEn": "Charizard",
    "types": ["fire", "flying"],
    "baseStats": {
      "hp": 78,
      "attack": 84,
      "defense": 78,
      "spAttack": 109,
      "spDefense": 85,
      "speed": 100
    },
    "abilities": [
      { "name": "もうか", "nameEn": "Blaze" },
      { "name": "サンパワー", "nameEn": "Solar Power" }
    ],
    "learnableMoveIds": [53, 394, 56]
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `number` | 全国図鑑番号 |
| `name` | `string` | 日本語名 |
| `nameEn` | `string` | 英語名（`@smogon/calc` との照合用） |
| `types` | `PokemonType[]` | タイプ（1〜2要素） |
| `baseStats` | `BaseStats` | 種族値 |
| `abilities` | `{ name, nameEn }[]` | 持てる特性（隠れ特性含む） |
| `learnableMoveIds` | `number[]` | 覚えられるわざの ID リスト（`moves.json` の `id` と対応） |

---

## moves.json

```json
[
  {
    "id": 53,
    "name": "かえんほうしゃ",
    "nameEn": "Flamethrower",
    "power": 90,
    "type": "fire",
    "category": "special"
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `number` | PokeAPI のわざ ID |
| `name` | `string` | 日本語名 |
| `nameEn` | `string` | 英語名（`@smogon/calc` との照合用） |
| `power` | `number \| null` | 威力（変動・なしは null） |
| `type` | `PokemonType` | わざタイプ |
| `category` | `"physical" \| "special" \| "status"` | 分類 |

---

## items.json

```json
[
  {
    "name": "いのちのたま",
    "nameEn": "Life Orb"
  }
]
```

| フィールド | 型 | 説明 |
|---|---|---|
| `name` | `string` | 日本語名 |
| `nameEn` | `string` | 英語名（`@smogon/calc` との照合用） |

---

## abilities.json

特性ごとの横断データ（説明文等）。ポケモンごとの特性リストは `pokemon.json` に持つ。

```json
[
  {
    "name": "もうか",
    "nameEn": "Blaze",
    "description": "HP が 1/3 以下になると、ほのおタイプのわざの威力が 1.5 倍になる"
  }
]
```

---

## データ更新手順

チャンピオンズのアップデートや新ポケモン追加時のみ実行する。

```bash
# scripts/ 配下のデータ取得スクリプトを実行
pnpm run fetch-pokemon-data

# 差分を確認してコミット
git diff app/src/contexts/games/pokemon/damage-calc/infrastructure/data/
git add app/src/contexts/games/pokemon/damage-calc/infrastructure/data/
git commit -m "chore(damage-calc): ポケモンデータを更新"
```

スクリプトの詳細は `scripts/fetch-pokemon-data.ts` を参照。

---

## Phase 2 以降

構築シェア（`team-builds`）で DB が導入された時点で、`team-builds` コンテキストの `data/schema.md` に DB テーブル設計を記述する。`damage-calc` の静的 JSON は Phase 2 以降も継続使用する。
