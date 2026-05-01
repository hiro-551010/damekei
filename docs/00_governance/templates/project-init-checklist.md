# プロジェクト初期化チェックリスト

このテンプレートを新プロジェクトに適用する際の手順。

---

## 1. リポジトリ作成

- [ ] Git リポジトリを作成する
- [ ] `main` ブランチを作成し、`develop` ブランチを切る
- [ ] `.gitignore` を作成する

---

## 2. テンプレートのコピー

以下をリポジトリルートにコピーする：

- [ ] `CLAUDE.md`
- [ ] `docs/00_governance/`（そのまま使用。プロジェクト固有の変更は不要）
- [ ] `docs/01_project/`（プレースホルダー状態。次のステップで埋める）
- [ ] `.claude/commands/`（カスタムコマンド。`evaluate-idea` 等）

以下のディレクトリを空で作成する：

- [ ] `docs/10_contexts/`
- [ ] `docs/20_decisions/`
- [ ] `docs/30_frontend/`（Web フロントエンドを含む場合のみ）
- [ ] `notes/til/`
- [ ] `notes/investigation/`
- [ ] `notes/discussion/`
- [ ] `notes/meetings/`

---

## 3. `docs/01_project/` を埋める（推奨順序）

以下の順序で記述する。前のファイルの内容が後のファイルに影響するため。

1. **`tech-stack.md`**（最優先）
   - プロジェクト概要・技術スタック・Bounded Context 一覧を決める
   - 以降のすべてのファイルがこれに依存する

2. **`infrastructure.md`**
   - ホスティング・DB・認証・監視等のサービスを選定する
   - 初期構成とスケール時の移行先を決める

3. **`directory-structure.md`**
   - tech-stack.md で決めた構成に基づき、具体的なディレクトリツリーを記述する

4. **`local-setup.md`**
   - 依存インストール・DB 起動のコマンドを記述する

5. **`implementation-order.md`**
   - 汎用順序にプロジェクト固有のステップを追加する

6. **`ci-rules.md`**
   - ディレクトリ構造に基づいた変更判定パスを記述する

7. **`e2e-policy.md`**（E2E テストを行う場合）
   - E2E ツール・ディレクトリ構成・テスト DB 設定を記述する

---

## 4. 最初の Bounded Context を定義する

`docs/10_contexts/<ctx>/` に最初のコンテキストを作成する。
テンプレートは `docs/00_governance/templates/context-template.md` を参照。

最低限必要なファイル：

- [ ] `_index.md` — コンテキストの概要
- [ ] `context.md` — 責務・境界・依存関係
- [ ] `domain/model.md` — Aggregate・Entity・ValueObject
- [ ] `domain/rules.md` — 不変条件・バリデーション

---

## 5. 初期環境構築

CLAUDE.md 5.5（初期環境構築）に基づき、`develop` に直接コミットしてよい。

- [ ] パッケージマネージャーの初期化
- [ ] フレームワークのセットアップ
- [ ] Linter / フォーマッターの設定
- [ ] Docker Compose（DB 等）の設定
- [ ] CI ワークフローの作成

---

## 6. Obsidian 設定（任意）

プロジェクトルートを Obsidian Vault として開く場合：

- [ ] `.obsidian/` ディレクトリを `.gitignore` に追加するか、共有するかを決める
- [ ] `notes/` の運用方針を確認する（`docs/00_governance/notes-policy.md`）

---

## 完了確認

- [ ] `docs/01_project/` の全ファイルに TODO が残っていないこと
- [ ] 最低1つの Bounded Context が `docs/10_contexts/` に定義されていること
- [ ] `CLAUDE.md` の参照ファイルがすべて存在すること
- [ ] `develop` ブランチで CI が通ること（CI 構築済みの場合）
