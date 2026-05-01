# ユースケース（team-builds）

Server Actions 経由で呼び出す。

---

## コマンド一覧

| コマンド | 説明 | 認証 |
|---|---|---|
| `SaveBuild` | 構築を新規作成または上書き保存する | 必須 |
| `DeleteBuild` | 構築を削除する | 必須（所有者のみ） |

## クエリ一覧

| クエリ | 説明 | 認証 |
|---|---|---|
| `GetMyBuilds` | 自分の構築一覧を取得する | 必須 |
| `GetBuildByShareToken` | 共有トークンで構築を取得する | 不要 |

---

## SaveBuild

### 入力

```typescript
type SaveBuildInput = {
  id?: string;        // 省略時は新規作成、指定時は上書き
  name: string;
  slots: BuildSlotInput[];
};

type BuildSlotInput = {
  slotIndex: number;        // 0〜5
  pokemonId: number | null;
  nature: string;
  statPoints: StatPointsInput;
  abilityNameEn: string;
  itemNameEn: string;
  boosts: StatBoostsInput;
  moveNameEn: string;
};
```

### 出力

```typescript
type SaveBuildResult = {
  id: string;
  shareToken: string;
};
```

### 処理

1. 認証済みユーザーを取得。未認証は `AuthError` を throw
2. `id` が指定された場合、所有者チェック。不一致は `ForbiddenError` を throw
3. domain バリデーション（name 長さ、StatPoints 範囲等）
4. `id` 省略時：`shareToken` を生成して新規 INSERT
5. `id` 指定時：`updatedAt` を更新して UPDATE

---

## DeleteBuild

### 入力

```typescript
type DeleteBuildInput = { id: string };
```

### 処理

1. 認証済みユーザーを取得。未認証は `AuthError`
2. 所有者チェック。不一致は `ForbiddenError`
3. DELETE

---

## GetMyBuilds

### 入力

なし（セッションからユーザーを特定）

### 出力

```typescript
type BuildSummaryDto = {
  id: string;
  name: string;
  shareToken: string;
  slotCount: number;    // pokemonId が null でない枠の数
  createdAt: string;    // ISO 8601
  updatedAt: string;
};
```

### 処理

1. 認証済みユーザーを取得。未認証は `AuthError`
2. `userId` でフィルタして取得、`updatedAt` 降順

---

## GetBuildByShareToken

### 入力

```typescript
type GetBuildByShareTokenQuery = { shareToken: string };
```

### 出力

```typescript
type BuildDetailDto = {
  id: string;
  name: string;
  shareToken: string;
  slots: BuildSlotDto[];
  createdAt: string;
  updatedAt: string;
};

type BuildSlotDto = {
  slotIndex: number;
  pokemonId: number | null;
  nature: string;
  statPoints: StatPointsDto;
  abilityNameEn: string;
  itemNameEn: string;
  boosts: StatBoostsDto;
  moveNameEn: string;
};
```

### 処理

1. `shareToken` で検索。見つからない場合は `NotFoundError`
2. 認証不要（RLS で SELECT は全員許可）

### エラー

| 条件 | エラー |
|---|---|
| shareToken が存在しない | `NotFoundError` |
| 認証が必要な操作で未認証 | `AuthError` |
| 所有者以外が更新・削除 | `ForbiddenError` |
| name が空または 50 文字超 | `DomainError` |
| StatPoints が範囲外または合計超過 | `DomainError` |
