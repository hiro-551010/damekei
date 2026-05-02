# ドメインエラー（pokemon/damage-calc）

## エラークラス一覧

| クラス | 継承元 | 説明 |
|---|---|---|
| `DomainError` | `Error` | ドメインルール違反の基底クラス |
| `NotFoundError` | `Error` | ポケモン・技が見つからない |

---

## DomainError

バリデーション違反（努力値の範囲・合計超過・特性の不一致など）で throw する。
詳細な不変条件は `domain/rules.md` を参照。

## NotFoundError

```typescript
throw new NotFoundError("Pokemon not found: 25");
```

`PokemonRepository.getById()` が対象を発見できなかった場合に throw する。
