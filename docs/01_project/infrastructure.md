# インフラ構成

汎用的な判断基準は `docs/00_governance/infrastructure-guide.md` を参照すること。

---

## 方針

**無料枠スタート → 必要に応じて AWS へスケール**

- 初期は無料枠のあるマネージドサービスで構築する
- トラフィック・データ量の増加に応じて AWS に移行する
- infrastructure 層のアダプター差し替えで移行できる設計を維持する

---

## 推奨構成

### Phase 1: 無料枠スタート（MVP・ダメ計のみ）

クライアント完結のため API・DB は不要。

| カテゴリ | サービス | 無料枠 | 備考 |
|---|---|---|---|
| ホスティング（Web） | Vercel | 100GB帯域/月、SSL自動 | Next.js本家、ゼロ設定でデプロイ可能 |
| CI/CD | GitHub Actions | 2,000分/月（Free） | パブリックリポジトリは無制限 |
| 監視・ログ | Vercel Analytics（無料） | 標準で同梱 | 必要なら Sentry を追加 |

### Phase 2: 構築シェア追加（DB・認証必要）

| カテゴリ | サービス候補 | 無料枠 | 備考 |
|---|---|---|---|
| ホスティング（Web/API） | Vercel（継続） | 100GB帯域/月 | API Routes / Server Actions を同居 |
| DB | Supabase（PostgreSQL） | 500MB | Supabase に確定 |
| 認証 | Supabase Auth | 5万MAU | Supabase に確定 |
| ストレージ | Supabase Storage | 1GB | アバター画像等（必要になれば） |

### Phase 3: 架空ポケ生成

追加インフラは現時点で未定。共有が大量になればキャッシュ層追加を検討。

### Phase 4: AWS スケール（トラフィック増加時）

| カテゴリ | 移行先 | 移行のトリガー |
|---|---|---|
| ホスティング（Web） | AWS CloudFront + S3 / ECS Fargate | Vercel の帯域・関数実行時間の無料枠を超過 |
| DB | AWS RDS (PostgreSQL) | Supabase/Turso の容量・接続数上限到達 |
| 認証 | AWS Cognito | 認証 SaaS の MAU 超過 or コスト増 |
| ストレージ | AWS S3 | 無料枠超過 |
| 監視・ログ | AWS CloudWatch + X-Ray | ログ量増加時 |

---

## 移行時の影響範囲

infrastructure 層のアダプター差し替えのみ。domain / application 層は変更しない。

```
変更するもの:
  - infrastructure 層の実装（Repository、外部サービスクライアント等）
  - 環境変数（接続先 URL、認証情報等）
  - Docker Compose / デプロイ設定

変更しないもの:
  - domain 層
  - application 層
  - presentation 層（原則）
  - テスト（infrastructure のインテグレーションテストは更新が必要）
```

---

## 環境変数

| 変数名 | 用途 | フェーズ | 例 |
|---|---|---|---|
| `NEXT_PUBLIC_POKEAPI_BASE_URL` | PokeAPIベースURL（差し替え可能化） | Phase 1〜 | `https://pokeapi.co/api/v2` |
| `DATABASE_URL` | DB 接続文字列 | Phase 2〜 | Supabase/Turso の値を設定 |
| `AUTH_SECRET` | 認証セッション署名キー | Phase 2〜 | `openssl rand -base64 32` で生成 |
| `NEXT_PUBLIC_APP_URL` | アプリのパブリックURL（OG画像等） | Phase 2〜 | `https://damekei.app` |
