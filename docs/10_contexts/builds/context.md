# team-builds コンテキスト定義

## 責務

- ユーザーの認証（サインアップ・ログイン・ログアウト）を管理する
- ユーザーが作成した構築（パーティ6枠の設定）を保存・取得・削除する
- 構築ごとに共有トークンを発行し、URL 経由での閲覧を可能にする

## 境界（このコンテキストがやらないこと）

- ダメージ計算ロジック（→ `damage-calc` コンテキスト）
- 架空ポケモンの定義（→ `phantom-pokemon` コンテキスト）
- 構築の閲覧 UI（→ `damage-calc` の presentation 層が共有トークンを受け取って表示する）

## 他コンテキストとの依存関係

```
damage-calc ←依存なし← team-builds
```

- `team-builds` は `damage-calc` に依存しない
- `damage-calc` の presentation 層が共有トークンを URL パラメータとして受け取り、`team-builds` の application 層を呼んで構築データを取得する
- bounded-context 間の直接依存は発生しない（presentation 層での協調に留める）

## 認証方式

- **メール + パスワード**（主）
- **Google OAuth**（オプション、Supabase Auth で設定）
- セッション管理は Supabase Auth に委譲する

## 技術的な境界

- DB・認証は Supabase に委譲し、infrastructure 層でラップする
- Supabase の型・クライアントは infrastructure 層に閉じる
- Server Actions を使用して DB 操作を行う（API Routes は使わない）
- RLS（Row Level Security）で所有者以外の write を DB レベルでブロックする
