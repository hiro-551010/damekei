# Tech Stack

## プロジェクト概要

「ダメけい！」は、ポケモンチャンピオンズ向けのダメージ計算・構築支援 Webサービス。架空ポケモン（仮想種族値・技構成）と戦わせて構築検討できる点が差別化ポイント。

---

## モノレポ構成

単一アプリ構成（モノレポではない）。`app/` ディレクトリ配下に Next.js プロジェクトを置く。

---

## コア技術

### フロントエンド

| 用途 | 技術 |
|---|---|
| 言語 | TypeScript |
| フレームワーク | Next.js（App Router） |
| UIライブラリ | React |
| スタイリング | Tailwind CSS |
| UIコンポーネント | shadcn/ui |
| 状態管理 | React ビルトイン（`useState` / `useReducer` / `useContext`）。Phase 2 以降で必要になれば Zustand 等を検討 |
| ダメージ計算ロジック（ポケモン） | `@smogon/calc`（MIT、ブラウザ/Node 両対応） |
| ダメージ計算ロジック（LoL） | 自前実装（domain層 `DamageCalculator`）。LoL Wiki の計算式に基づく |
| データソース（ポケモン） | PokeAPI（無料・認証不要・日本語対応） |
| データソース（LoL） | Meraki Analytics（`cdn.merakianalytics.com`）。Data Dragon より精度高く Lethality・魔法貫通・スキル係数を正確に提供 |

### バックエンド

Phase 1 ではバックエンド不要（クライアント完結の SPA/SSG）。
Phase 2 以降で構築シェアのため Next.js の API Routes / Server Actions と DB を導入する。

| 用途 | 技術 |
|---|---|
| API | Next.js API Routes / Server Actions |
| DB | Supabase（PostgreSQL） |
| 認証 | Supabase Auth |

### 共有パッケージ

なし（単一アプリ構成のため）。

---

## 開発ツール

| 用途 | 技術 |
|---|---|
| パッケージマネージャー | TBD（npm / pnpm / bun のいずれか。プロジェクト初期化時に確定） |
| テストフレームワーク | TBD（Vitest 想定） |
| Lint | ESLint（Next.js デフォルト） |
| フォーマッター | Prettier |
| 実行環境 | Docker（`docker compose up` で開発サーバー起動） |

---

## 主要コマンド

```bash
# 開発サーバー起動（Docker）
docker compose up

# 依存インストール（コンテナ内）
docker compose exec web npm install

# テスト実行
docker compose exec web npm test

# Lint
docker compose exec web npm run lint
```

---

## 技術選定の理由

| 技術 | 理由 |
|---|---|
| Next.js（App Router） | Phase 1 のSSG/CSRから Phase 2 のAPI同居まで一貫対応。Vercel 無料枠でデプロイ可能 |
| TypeScript | `@smogon/calc` が TypeScript 製で型定義同梱、フロント全体で型安全を維持 |
| Tailwind CSS | shadcn/ui との相性、やわらかいトーン（パステル系）を作りやすい |
| shadcn/ui | コピペ式でカスタマイズ自由、ブラックボックス化しない、軽量 |
| `@smogon/calc` | Pokémon Showdown公式の計算ロジック。実績あり、自前実装の手間を省ける |
| PokeAPI | 無料・認証不要・日本語対応、第1〜9世代を網羅 |
| Docker | 環境差異を吸収、本番デプロイ時の再現性確保 |

---

## レイヤーと技術の対応

| レイヤー | 使用技術 |
|---|---|
| presentation | Next.js（App Router）、React、shadcn/ui、Tailwind CSS |
| application | TypeScript（純粋なユースケース） |
| domain | TypeScript（外部依存なし） |
| infrastructure | `@smogon/calc`（計算）、PokeAPI クライアント、Phase 2 以降 DB クライアント |

---

## Bounded Context

| Context | 説明 | 着手フェーズ |
|---|---|---|
| `games/pokemon/damage-calc` | ポケモンのダメージ計算。`@smogon/calc` に委譲 | Phase 1 |
| `games/lol/damage-calc` | LoL のダメージ計算。Meraki Analytics + 自前計算式 | Phase 1（ポケモン後） |
| `builds` | 構築シェア。全ゲーム横断で保存・公開・閲覧 | Phase 2 |
| `games/pokemon/phantom-pokemon` | 架空ポケ生成。仮想種族値・技構成のポケモンを定義して計算に投入 | Phase 3 |
