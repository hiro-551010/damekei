# ユースケース（damage-calc）

Phase 1 は内部 API なし。presentation 層のコンポーネントから直接呼び出す。

---

## クエリ一覧

| クエリ | 説明 |
|---|---|
| `GetPokemonList` | 利用可能なポケモン種族一覧を返す |
| `GetPokemonDetail` | 指定ポケモンの詳細（わざ・特性・持ち物）を返す |
| `CalculateDamage` | ダメージレンジを計算して返す |

コマンド（状態変更）は Phase 1 では存在しない。

---

## GetPokemonList

### 入力

なし（全件返す）

### 出力

```typescript
type PokemonListItemDto = {
  id: number;         // 全国図鑑番号
  name: string;       // 日本語名
  nameEn: string;     // 英語名
  types: PokemonType[];
  baseStats: BaseStatsDto;
};

type BaseStatsDto = {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
};
```

### 処理

1. `PokemonRepository.getAll()` を呼ぶ
2. ソート順：全国図鑑番号昇順

---

## GetPokemonDetail

指定したポケモンが持てる特性・わざ・おすすめ持ち物の一覧を返す。
ユーザーがパラメータ入力フォームに選択肢を表示するために使う。

### 入力

```typescript
type GetPokemonDetailQuery = {
  pokemonId: number;  // 全国図鑑番号
};
```

### 出力

```typescript
type PokemonDetailDto = {
  id: number;
  name: string;
  nameEn: string;
  types: PokemonType[];
  baseStats: BaseStatsDto;
  abilities: AbilityDto[];
  moves: MoveDto[];
};

type AbilityDto = {
  name: string;
  nameEn: string;
};

type MoveDto = {
  id: number;
  name: string;
  nameEn: string;
  power: number | null;
  type: PokemonType;
  category: MoveCategory;
};
```

### 処理

1. `PokemonRepository.getById(pokemonId)` を呼ぶ
2. 見つからない場合は `NotFoundError` を throw

---

## CalculateDamage

### 入力

```typescript
type CalculateDamageQuery = {
  attacker: PokemonInputDto;
  defender: PokemonInputDto;
  moveNameEn: string;
  hitCount?: number;          // 複数ヒット技の指定ヒット数（省略時は @smogon/calc のデフォルト）
  field?: FieldConditionDto;  // フィールド状態（天候・テレイン等）
};

// チャンピオンズではレベル（50固定）・個体値（全31固定）はユーザー入力不要
type PokemonInputDto = {
  pokemonId: number;
  nature: string;          // 性格名（英語）
  statPoints: StatPointsDto;
  abilityName: string;     // 英語名
  itemName: string | null; // 英語名。null = 持ち物なし
  boosts: StatBoostsDto;
};

type StatPointsDto = {
  hp: number;        // 0〜32
  attack: number;    // 0〜32
  defense: number;   // 0〜32
  spAttack: number;  // 0〜32
  spDefense: number; // 0〜32
  speed: number;     // 0〜32
  // 合計 ≤ 66
};

type StatBoostsDto = {
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
};

type MoveInputDto = {
  moveNameEn: string;  // @smogon/calc との照合に英語名を使用
};

type FieldConditionDto = {
  weather?: "sun" | "rain" | "sand" | "snow" | null;
  terrain?: "electric" | "grassy" | "misty" | "psychic" | null;
};
```

### 出力

```typescript
type DamageResultDto = {
  rolls: number[];
  hitCount: number;    // 実際のヒット数（通常技は 1）
  min: number;
  max: number;
  percentages: number[];
  minPercent: number;
  maxPercent: number;
  knockoutChance: "guaranteed" | "high" | "low" | "guaranteed_no";
};
```

### 処理

1. `attacker.pokemonId` と `defender.pokemonId` で `PokemonRepository.getById()` を呼ぶ
2. DTO → domain モデル（`Pokemon`）に変換。domain のバリデーションを通す
3. `DamageCalculator.calculate(attacker, defender, move, field, hitCount)` を呼ぶ（infrastructure 層が `@smogon/calc` をラップ）
4. 結果を `DamageResultDto` に変換して返す

### エラー

| 条件 | エラー |
|---|---|
| `pokemonId` が存在しない | `NotFoundError` |
| `statPoints` の値が範囲外（各 0〜32 または合計 > 66） | `DomainError` |
| `abilityName` が対象ポケモンの特性でない | `DomainError` |
