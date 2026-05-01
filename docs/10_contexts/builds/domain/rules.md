# ドメインルール（team-builds）

## TeamBuild

- `name` は 1〜50 文字。空文字・空白のみは不可
- `slots` は常に 6 要素（slotIndex 0〜5）。欠けている場合は空枠として補完する
- `shareToken` は作成時に自動生成する。ユーザーが指定しない
- 更新できるのは所有者（`userId` が一致するユーザー）のみ

## BuildSlot

- `slotIndex` は 0〜5 の整数
- `pokemonId` が null のスロットは「空枠」とみなす。他フィールドの値は保存するが計算・表示には使わない
- `statPoints` の各値は 0〜32、合計 ≤ 66（damage-calc のルールと同一）
- `boosts` の各値は −6〜＋6

## 認可

- 構築の作成・更新・削除は認証済みユーザーのみ
- 構築の閲覧（`shareToken` 経由）は未認証ユーザーを含む全員が可能
- DB レベルでは RLS（Row Level Security）により所有者以外の write を拒否する

## バリデーションのレイヤー責任

- **domain 層**：不変条件の検証（name 長さ、statPoints 範囲等）
- **application 層**：認証状態の確認、所有者チェック
- **presentation 層**：入力フォームの UI バリデーション（未入力チェック等）
