# Codex Operating Model（DDD + Obsidian運用）

**設計方針：** このファイルは特定の技術スタックに依存しない粒度で記述する。汎用ガバナンスは `docs/00_governance/`、プロジェクト固有の設定は `docs/01_project/` に集約し、そのファイルパスを AGENTS.md に記述する。

## 0. Codexへの指示

### 参照ファイル（作業前に必ず読むこと）

- ディレクトリ構造（汎用）：`docs/00_governance/directory-structure.md`
- ディレクトリ構造（具体）：`docs/01_project/directory-structure.md`

### 詳細ルール（該当作業時に必ず読むこと）

- 技術スタック：`docs/01_project/tech-stack.md`（新規実装時）
- ローカルセットアップ：`docs/01_project/local-setup.md`（初回セットアップ時）
- プロジェクト初期化：`docs/00_governance/templates/project-init-checklist.md`（新規プロジェクト立ち上げ時）
- ワークフロー：`docs/00_governance/workflow.md`（ブランチ作成・PR作成時）
- 実装順序：`docs/00_governance/implementation-order.md` / `docs/01_project/implementation-order.md`（新規コンテキスト実装時）
- 命名規則：`docs/00_governance/naming-conventions.md`（アプリケーション層実装時）
- テストポリシー：`docs/00_governance/test-policy.md`（テスト作成・修正時）
- E2Eテストポリシー：`docs/01_project/e2e-policy.md`（E2Eテスト作成・修正時）
- 例外処理ポリシー：`docs/00_governance/error-policy.md`（実装時）
- Shared Kernelルール：`docs/00_governance/shared-kernel-rules.md`（`shared_kernel/` 変更時）
- CIルール：`docs/01_project/ci-rules.md`（CI設定・ワークフロー変更時）
- Git運用ルール：`docs/00_governance/git-rules.md`（ブランチ作成・コミット・PRマージ時）
- フロントエンド原則：`docs/00_governance/frontend-principles.md`（フロントエンド実装時。Web フロントエンドを含まないプロジェクトでは参照不要）
- Context 間連携：`docs/00_governance/context-integration.md`（Bounded Context 間の連携が必要な場合）
- インフラ判断ガイド：`docs/00_governance/infrastructure-guide.md` / `docs/01_project/infrastructure.md`（インフラ選定・移行時）
- セキュリティ方針：`docs/00_governance/security-policy.md`（認証・認可実装時）
- 削除・廃止ポリシー：`docs/00_governance/deprecation-policy.md`（機能削除・DBマイグレーション時）

### 振る舞いルール

- 作業前に「参照ファイル」セクションのファイルを必ず読む。詳細ルールは該当作業時に読む。
- 実装前に対象 bounded-context とレイヤーをユーザーに確認する。
- ドキュメント（`docs/10_contexts/<ctx>/`）と実装の乖離を見つけたら必ず指摘する。
- `shared_kernel/` への追加を求められたら `docs/00_governance/shared-kernel-rules.md` を確認する。
- 変更範囲が不明な場合は実装前にユーザーに確認する。
- **ドキュメント更新なしに実装コードを書いてはならない。** 仕様が未更新のまま実装を求められた場合は、実装を開始する前に対象ドキュメント（`docs/10_contexts/<ctx>/` および `docs/30_frontend/<ctx>/`）を更新し、ユーザーに確認を取ること。
- **実装コードを書く際は、同一の応答内でドキュメントを先に更新し、その後にコードを書く（docs 先・実装後の順序を必ず守る）。**
- **`feature/` ブランチ作業中に `docs/00_governance/` または `AGENTS.md` の変更が必要になった場合は、必ず作業を中断し、`docs/00_governance/workflow.md` の 5.8 のワークフローに従うこと。`docs/01_project/` の変更は `chore/` ブランチで対応する。**

### コーディング行動ガイドライン

> 慎重さに偏るバイアスがあるため、単純なタスクでは省略してよい。

#### 1. 実装前に考える

- 前提条件は明示する。不確かなら質問する。
- 解釈に幅がある場合は選択肢を提示する。黙って一つに決めない。
- よりシンプルな代替案があれば提案する。必要なら指示に反論する。
- 不明点が残ったまま進めない。何が不明かを明示して聞く。

#### 2. シンプルさを優先する

- 求められた以上の機能を追加しない。
- 単一用途のコードに抽象化を持ち込まない。
- 求められていない「柔軟性」「設定可能性」を入れない。
- 起こり得ないシナリオのエラーハンドリングを書かない。
- 200 行で書けたものが 50 行に収まるなら書き直す。

#### 3. 外科的な変更にとどめる

既存コードを編集するとき：

- 隣接するコード・コメント・フォーマットを「ついでに改善」しない。
- 壊れていないものをリファクタしない。
- 自分の流儀と違っても既存スタイルに合わせる。
- 無関係なデッドコードに気づいたら**言及する**。勝手に削除しない。

自分の変更が孤立コードを生んだ場合：

- 変更により不要になった import / 変数 / 関数は削除する。
- 既存のデッドコードは指示がない限り削除しない。

#### 4. 目標駆動で進める

タスクを検証可能なゴールに変換する：

- 「バリデーション追加」 → 「不正入力のテストを書き、通過させる」
- 「バグ修正」 → 「再現するテストを書き、通過させる」

複数ステップのタスクでは簡単な計画を述べる：

```
1. [ステップ] → 確認: [チェック]
2. [ステップ] → 確認: [チェック]
```

### 実装の委譲（Codex → codex）

このプロジェクトでは役割を分担する：

- **Codex**: プランニング、設計ドキュメント作成、codex 出力のレビュー
- **codex**: コード生成、テスト実装

#### フロー

1. Codex が要件を整理し、`docs/10_contexts/<ctx>/` または `docs/30_frontend/<ctx>/` の設計ドキュメントを作成・更新する。
2. Docs ゲートをパスしたことを Codex が確認する。
3. Codex が codex への実装プロンプトを組み立てる。プロンプトには以下を必ず含める：
   - 対象 bounded-context とレイヤー
   - 参照すべきドキュメントのパス
   - `AGENTS.md` の「コーディング行動ガイドライン」を遵守する旨
   - 実装範囲（変更ファイル）と完了条件（テスト緑、型チェック通過等）
4. Codex が `codex exec "<プロンプト>"` を実行する。
5. Codex が生成された差分をレビューし、ガイドライン違反・要件との乖離があれば指摘する。
6. 必要に応じて 4 へ戻り、追加プロンプトで codex に修正を依頼する。

#### Codex が直接実装してよい例外

- ドキュメント・設定ファイル（`.md` / `.json` / `.yml` / `Dockerfile` 等）の更新
- 1 ファイル数行の typo・パス修正
- codex が同じ箇所で複数回失敗した後の最小限の手当て

#### codex 呼び出しテンプレート

````bash
codex exec "$(cat <<'EOF'
# Task
<実装内容を 1〜2 行で>

## 参照ドキュメント
- docs/10_contexts/<ctx>/...

## ガイドライン
- AGENTS.md の「コーディング行動ガイドライン」を遵守する
- 既存のディレクトリ構造（app/src/contexts/<ctx>/...）に従う

## 完了条件
- ユニットテストが緑
- 型チェック通過
EOF
)"
````

---

## 1. 基本思想

- 本プロジェクトは DDD（Domain Driven Design）を採用する。
- Bounded Context 単位でコードと設計を分離する。
- ドキュメントを正本（Source of Truth）とし、実装はそれに従う。
- main / develop ブランチは常に「ドキュメントとコードが整合し、動作する状態」を維持する。

---

## 2. Obsidian 運用

詳細は `docs/00_governance/notes-policy.md` を参照すること。

`docs/` が正式ドキュメント（正本）であるのに対し、`notes/` は正式化する前の思考・共有の場として Obsidian で管理する。議論・調査が合意に至った場合は `docs/` または `docs/20_decisions/` に昇格させる。

---

## 3. ディレクトリ構造

詳細は `docs/00_governance/directory-structure.md` を参照すること。

- bounded-context の実装ディレクトリと `docs/10_contexts/<ctx>/` は 1:1 対応する。
- shared kernel はドメイン知識を含めない。
- 複数アプリ間で共有するコードは専用パッケージに分離し、ドメイン知識を含めない。
- DB変更はコンテキスト単位で管理する。
- `docs/30_frontend/` は Web フロントエンドを含むプロジェクトでのみ使用する。

---

## 4. 依存関係ルール（厳守）

1. domain は外部ライブラリに依存しない。
2. application は domain に依存可能。
3. infrastructure は domain の Repository IF を実装する。
4. presentation は application を呼び出す。
5. bounded-context 同士は直接依存しない。
6. 依存違反は CI で検出する（具体的なツール・配置は `docs/01_project/ci-rules.md` を参照）。

---

## 5. ワークフロー

**原則：ドキュメントは正本（Source of Truth）。実装はドキュメントに従う。**
ドキュメントが更新されていない変更は、実装前であっても受け入れない。

詳細は `docs/00_governance/workflow.md` を参照すること。
ブランチ命名・コミット規約・マージ方法は `docs/00_governance/git-rules.md` を参照すること。

| 作業種別 | ブランチ | Docsゲート | 詳細 |
|---|---|---|---|
| 機能開発 / バグ修正 | `feature/` `fix/` | 必須 | 5.1 |
| コンテキストドキュメント変更 | `docs/<ctx>/` | 不要 | 5.2 |
| ガバナンス変更 / 横断ADR | `docs/governance/` | 不要 | 5.3 |
| リファクタリング | `refactor/` | 不要 | 5.4 |
| 環境・ツール変更 | `chore/` | 不要 | 5.5 |
| 初期環境構築 | develop 直接 | — | 5.6 |
| リリース | develop → main | — | 5.7 |
| ガバナンス変更割り込み | `docs/governance/` | — | 5.8 |

---

## 6. セキュリティ方針

詳細は `docs/00_governance/security-policy.md` を参照すること。

- 秘密情報は環境変数管理。domain層に秘密情報を持ち込まない。
- 認証は presentation 層、認可は application 層、認可ルール定義は domain 層。

---

## 7. バージョニング方針

- 破壊的変更は明示する。
- API互換性は可能な限り維持する。
- breaking change時はADRを追加する。

---

## 8. 削除・廃止ポリシー

詳細は `docs/00_governance/deprecation-policy.md` を参照すること。

- 機能削除は必ずドキュメント更新を伴う。
- deprecated状態を経由してから削除する。
- DBスキーマ変更は Expand → Migrate → Contract の3段階。

---

## 9. 禁止事項

- 仕様未更新での振る舞い変更
- domain層への外部依存追加
- bounded-contextの境界破壊
- shared_kernelの肥大化
- 未実装仕様の main / develop マージ
- 想定外例外の握りつぶし（UnexpectedErrorは必ずログ・監視対象）
- コンテキストのドキュメント・コードに他の bounded-context 名を直接記載すること（境界の曖昧化につながる）
