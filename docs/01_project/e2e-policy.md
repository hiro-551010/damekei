# E2E テストポリシー

## 概要

- **使用ツール**: Playwright（推奨。Phase 1 後半〜 Phase 2 で導入）
- **テスト対象**: フロントエンドのユーザーフロー（ダメージ計算入力 → 結果表示、構築保存 → シェア URL 確認 等）

Phase 1 の MVP 段階では unit/integration テスト中心とし、E2E は主要画面のスモークテストのみ実施する。

---

## テスト対象スコープ

| レベル | 内容 | 配置 |
|---|---|---|
| スモーク | 各ページが 200 で表示される / コンソールエラーが出ない | `app/e2e/smoke/` |
| ハッピーパス | ダメ計入力 → 計算結果表示 / 構築保存 → 公開 URL 表示 等 | `app/e2e/happy/` |
| 異常系 | 不正な数値入力時のバリデーションエラー、未認証アクセス時のリダイレクト | `app/e2e/error/` |

---

## ディレクトリ構成

```
app/
├── e2e/
│   ├── smoke/
│   ├── happy/
│   ├── error/
│   ├── fixtures/                # テストデータ（架空ポケ等）
│   └── playwright.config.ts
```

---

## テスト DB

- Phase 1: DB なし（テスト不要）
- Phase 2 以降: テスト用 DB はローカル Docker の独立コンテナで起動。各テスト前に truncate でリセット

---

## エラー検出時の出力

- スクリーンショット自動保存（失敗時のみ）
- HTML レポート出力（`playwright-report/`）
- 失敗ステップは `app/e2e/<level>/<test>.spec.ts:<行>` で特定可能にする

---

## 実行方法

```bash
# 全 E2E 実行
docker compose exec web npm run e2e

# 特定レベルだけ
docker compose exec web npm run e2e -- --grep smoke

# UIモードで実行（デバッグ用）
docker compose exec web npm run e2e:ui
```

---

## CI（GitHub Actions）

- PR ごとにスモークテストは必ず実行
- ハッピーパス・異常系は変更 ctx に該当する場合のみ実行（実行時間短縮のため）
- 失敗時は HTML レポートを Artifact として保存

---

## 関連ドキュメント

- テストポリシー（バックエンド）：`docs/00_governance/test-policy.md`
- フロントエンド原則：`docs/00_governance/frontend-principles.md`
