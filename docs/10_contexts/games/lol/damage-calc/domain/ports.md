# Ports（lol/damage-calc）

domain 層が定義するインターフェース（依存の抽象）。実装は infrastructure 層に置く。

---

## ChampionRepository

| メソッド | 引数 | 戻り値 | 説明 |
|---|---|---|---|
| `findAll` | なし | `Promise<ChampionSpecies[]>` | 全チャンピオンを返す |
| `findById` | `id: string` | `Promise<ChampionSpecies \| null>` | IDで取得。未発見は `null` |

---

## ItemRepository

| メソッド | 引数 | 戻り値 | 説明 |
|---|---|---|---|
| `findAll` | なし | `Promise<Item[]>` | 全アイテムを返す |
| `findById` | `id: number` | `Promise<Item \| null>` | IDで取得。未発見は `null` |
