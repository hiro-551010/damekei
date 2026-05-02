# Ports（pokemon/damage-calc）

domain 層が定義するインターフェース（依存の抽象）。実装は infrastructure 層に置く。

---

## PokemonRepository

| メソッド | 引数 | 戻り値 | 説明 |
|---|---|---|---|
| `getAll` | なし | `PokemonSpecies[]` | 全ポケモンを返す（同期） |
| `getById` | `id: number` | `PokemonSpecies \| undefined` | IDで取得。未発見は `undefined`（同期） |

LoL の `ChampionRepository` と異なり同期インターフェース。データはビルド時にバンドル済みのため。

---

## DamageCalculator

外部ライブラリ（smogon/calc）を抽象化したポート。

```typescript
interface DamageCalculator {
  calculate(
    attacker: Pokemon,
    defender: Pokemon,
    move: Move,
    field?: FieldCondition,
    hitCount?: number,
  ): DamageResult;
}
```

---

## FieldCondition

フィールド状態の型定義。

| フィールド | 型 |
|---|---|
| `weather` | `"sun" \| "rain" \| "sand" \| "snow" \| null \| undefined` |
| `terrain` | `"electric" \| "grassy" \| "misty" \| "psychic" \| null \| undefined` |
