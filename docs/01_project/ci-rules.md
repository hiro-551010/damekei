# CI ルール

## 目的

- PRの実行時間を抑えつつ、必要十分なテストを必ず回す
- 「どのctxが変わったか」をパスから判定し、対象だけ実行する

---

## 変更判定ルール（パス → ctx）

以下のパスに変更が入った場合、その `<ctx>` を「変更対象」とする：

| パス | ctx |
|---|---|
| `app/src/contexts/games/pokemon/damage-calc/**` | `games/pokemon/damage-calc` |
| `app/src/contexts/games/lol/damage-calc/**` | `games/lol/damage-calc` |
| `app/src/contexts/builds/**` | `builds` |
| `docs/10_contexts/games/pokemon/damage-calc/**` | `games/pokemon/damage-calc`（ドキュメント） |
| `docs/10_contexts/games/lol/damage-calc/**` | `games/lol/damage-calc`（ドキュメント） |
| `docs/10_contexts/builds/**` | `builds`（ドキュメント） |
| `docs/30_frontend/<ctx>/**` | 該当 ctx（画面設計） |

以下は **全ctx対象** とする（横断影響が大きい）：

- `app/src/shared_kernel/**`
- `app/src/lib/**`
- `app/src/app/**`（App Router 共通）
- `app/package.json` / `app/tsconfig.json` / `app/next.config.ts` / `app/tailwind.config.ts`
- `Dockerfile` / `docker-compose.yml` / `.dockerignore`
- `docs/00_governance/**`
- `docs/01_project/**`
- `.github/workflows/**`（CI設定）
- `CLAUDE.md`

---

## 実行するテスト（変更対象ctxがある場合）

変更対象となった各 `<ctx>` について以下を実行する：

- unit（必須）
- integration（必須：infra/外部サービス連携の変更がある場合）
- contract（必須：API 変更がある場合 / Phase 2 以降）
- e2e（詳細は `docs/01_project/e2e-policy.md` を参照）

---

## 常に実行するチェック（全PR）

- lint（ESLint / Prettier）
- format チェック
- 型チェック（`tsc --noEmit`）
- 依存ルール違反検知（DDDレイヤー間の依存違反）
- unit（変更ctx）
- ビルド成功確認（`next build`）

---

## CI実装メモ

- GitHub Actions を使用（`.github/workflows/`）
- Node.js のバージョンは Dockerfile と一致させる
- パッケージマネージャーのキャッシュを有効化して実行時間を短縮
- パブリックリポジトリ運用なら GitHub Actions の実行時間は無制限。プライベートにする場合は無料枠 2,000分/月 内に収める
