# ローカル環境セットアップ

## 前提

- Docker Desktop（または互換のコンテナランタイム）がインストール済み
- Git がインストール済み

---

## 1. Git ユーザー設定

このリポジトリ専用の名前・メールアドレスを設定する。
グローバル設定を汚さないようにローカル設定（`--local`）を使うこと。

```bash
git config --local user.name "Your Name"
git config --local user.email "your.email@example.com"
```

設定確認：

```bash
git config --local --list
```

---

## 2. 環境変数

`.env.example` をコピーして `.env.local` を作成し、各自の環境に合わせて編集する。

```bash
cp .env.example .env.local
```

`.env.local` は `.gitignore` に含まれているためコミットしない。

Phase 1 時点では環境変数はほぼ不要（PokeAPI が認証不要のため）。Phase 2 以降で DB・認証情報が追加される。

---

## 3. ポケモンデータの生成

`app/src/contexts/games/pokemon/damage-calc/infrastructure/data/` 以下の JSON は git 管理外のため、初回セットアップ時に生成する。

```bash
npm run fetch-pokemon-data
```

数分かかる。完了すると `pokemon.json` / `moves.json` / `abilities.json` が生成される。

---

## 4. Docker で起動

```bash
# 開発サーバー起動（ホットリロード有効）
docker compose up

# バックグラウンド起動
docker compose up -d

# 停止
docker compose down
```

ブラウザで `http://localhost:3000` にアクセスして動作確認する。

---

## 5. コンテナ内での操作

```bash
# 依存追加
docker compose exec web npm install <package>

# テスト実行
docker compose exec web npm test

# Lint
docker compose exec web npm run lint

# シェルに入る
docker compose exec web sh
```

---

## 6. トラブルシュート

| 症状 | 対処 |
|---|---|
| ポート 3000 が既に使われている | `docker-compose.yml` のポートマッピングを変更する、または既存プロセスを停止 |
| ホットリロードが効かない | `docker-compose.yml` でボリュームマウントが正しく設定されているか確認 |
| `node_modules` が壊れた | `docker compose down -v` でボリュームを削除し再起動 |
