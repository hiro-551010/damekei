# ドメインエラー（builds）

## エラークラス一覧

| クラス | 継承元 | 説明 |
|---|---|---|
| `DomainError` | `Error` | ドメインルール違反の基底クラス |
| `AuthError` | `Error` | 未認証（ログイン必須） |
| `ForbiddenError` | `Error` | 認可エラー（操作権限なし） |
| `NotFoundError` | `Error` | リソース未発見 |

---

## AuthError

```typescript
throw new AuthError(); // デフォルトメッセージ: "ログインが必要です"
```

presentation 層でキャッチし、ログイン画面へリダイレクトする。

## ForbiddenError

```typescript
throw new ForbiddenError(); // デフォルトメッセージ: "権限がありません"
```

他のユーザーの構築を編集・削除しようとした場合に throw する。

## NotFoundError

```typescript
throw new NotFoundError(); // デフォルトメッセージ: "見つかりません"
```

## DomainError

バリデーション違反（構築名が空・長すぎる・スロットの不正値など）で throw する。
詳細は `domain/rules.md` を参照。
