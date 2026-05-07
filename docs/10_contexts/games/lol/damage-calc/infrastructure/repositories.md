# Infrastructure — Repositories（lol/damage-calc）

`domain/ports.md` で定義した `ChampionRepository` / `ItemRepository` の静的 JSON 実装。
モジュールロード時に JSON をメモリに展開し、手動収集データをマージして返す。

---

## champion-repository.ts

### 責務

- `champions.json`（スクリプト生成・gitignore）と `champion-passives.json`（手動収集・git管理）を
  モジュールロード時にマージし、`ChampionSpecies[]` を組み立てる
- `ChampionRepository` インターフェースを実装する

### マージロジック

`champion-passives.json` の各エントリは以下のフィールドを持てる。

| フィールド | 動作 |
|---|---|
| `passiveSpec` | `ChampionSpecies.passiveSpec` として追加 |
| `stateModifiers` | `ChampionSpecies.stateModifiers` として追加 |
| `skillVariants` | スロットが一致するスキルの `variants` フィールドに追加 |
| `skillOverrides` | スロットが一致するスキルのフィールドを上書き（`{ ...skill, ...override }`） |
| `aaCritOverride` | `ChampionSpecies.aaCritOverride` として追加。AA クリット挙動を上書きする |

> `skillOverrides` は Meraki データが正しく取得できないスキル（例: Ahri Q の damageType）を
> 修正するために使う。スプレッドによる上書きなので、変更が必要なフィールドだけ指定すればよい。

### データファイルの役割分担

| ファイル | 管理 | 内容 |
|---|---|---|
| `data/champions.json` | gitignore（スクリプト生成） | 全チャンピオンの基礎ステータス・スキル係数 |
| `data/champion-passives.json` | git管理（手動収集） | パッシブ・バリアント・ステート変化・スキル上書き |

---

## item-repository.ts

### 責務

- `items.json`（スクリプト生成・gitignore）と `item-passives.json`（手動収集・git管理）を
  モジュールロード時にマージし、`Item[]` を組み立てる
- `ItemRepository` インターフェースを実装する

### マージロジック

`items.json` の `passives` は常に空配列。`item-passives.json`（アイテム ID をキーとする）から
対応するパッシブ配列を取得し、`passives` フィールドとしてセットする。

### データファイルの役割分担

| ファイル | 管理 | 内容 |
|---|---|---|
| `data/items.json` | gitignore（スクリプト生成） | 全アイテムのステータス（`passives` は空） |
| `data/item-passives.json` | git管理（手動収集） | アイテム ID → `ItemPassive[]` のマッピング |

---

## container.ts

### 責務

- 各リポジトリを `createUseCases` に渡し、ユースケースインスタンスを生成する
- アプリケーション全体で共有するシングルトン（モジュールスコープ）

```typescript
export const lolDamageCalcUseCases = createUseCases(championRepository, itemRepository);
```
