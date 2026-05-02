# ドメインエラー（lol/damage-calc）

## エラークラス一覧

| クラス | 継承元 | 説明 |
|---|---|---|
| `DomainError` | `Error` | ドメインルール違反の基底クラス |
| `NotFoundError` | `DomainError` | チャンピオン・アイテムが見つからない |
| `InvalidSkillAllocationError` | `DomainError` | スキルポイント振り分けが不正 |

---

## DomainError

すべてのドメインエラーの基底クラス。presentation 層でキャッチして適切なエラー表示を行う。

## NotFoundError

```typescript
throw new NotFoundError("Champion", championId);
// → "Champion not found: Ahri"
```

`ChampionRepository.findById()` または `ItemRepository.findById()` が対象を発見できなかった場合に throw する。

## InvalidSkillAllocationError

スキルポイントの合計・Rランク制限・負値違反時に throw する。
詳細な不変条件は `domain/rules.md` の「スキルポイント振り分け」を参照。
