# ドメイン型（pokemon/damage-calc）

ドメイン全体で使用するプリミティブな型定義。

---

## PokemonType

ポケモンのタイプ（18種）。

```typescript
type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";
```

---

## MoveCategory

技のカテゴリ。

```typescript
type MoveCategory = "physical" | "special" | "status";
```

| 値 | 説明 |
|---|---|
| `"physical"` | 物理技。攻撃・防御で計算 |
| `"special"` | 特殊技。特攻・特防で計算 |
| `"status"` | 変化技。ダメージなし |

---

## KnockoutChance

16通りのダメージロールから算出した一撃KO確率。

```typescript
type KnockoutChance = "guaranteed" | "high" | "low" | "guaranteed_no";
```

| 値 | 条件 | 説明 |
|---|---|---|
| `"guaranteed"` | 16/16 がKO | 確定1発 |
| `"high"` | 9〜15/16 がKO | 高確率1発 |
| `"low"` | 1〜8/16 がKO | 低確率1発 |
| `"guaranteed_no"` | 0/16 がKO | 確定耐え |
