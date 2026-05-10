# Claude Code Operating Model（DDD + Obsidian運用）

**設計方針：** このファイルは特定の技術スタックに依存しない粒度で記述する。汎用ガバナンスは `docs/00_governance/`、プロジェクト固有の設定は `docs/01_project/` に集約し、そのファイルパスを CLAUDE.md に記述する。

## 0. Claude Codeへの指示

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
- テストポリシー：`docs/00_governance/test-policy.md`（domain / application 層の変更時・テスト作成・修正時）
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
- **`feature/` ブランチ作業中に `docs/00_governance/` または `CLAUDE.md` の変更が必要になった場合は、必ず作業を中断し、`docs/00_governance/workflow.md` の 5.8 のワークフローに従うこと。`docs/01_project/` の変更は `chore/` ブランチで対応する。**
- **domain / application 層の変更は TDD（Red→Green→Refactor）を必ず守る。** テスト記述と実装はそれぞれ別の Agent ツール呼び出しで行う。詳細は `docs/00_governance/test-policy.md` を参照。

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

#### 5. UI 変更時の視覚確認

presentation 層のコンポーネントを変更した場合、完了報告の前に必ずスクリーンショットで視覚確認を行う。

**前提：** Docker dev サーバーが localhost:3000 で起動していること。

```bash
npx tsx scripts/screenshot.ts <URL> /tmp/screenshot.png
```

**主要 URL：**
- LoL ダメージ計算: `http://localhost:3000/lol/damage-calc`

**フロー：**
1. コード変更
2. `scripts/screenshot.ts` でキャプチャ → Read ツールで PNG を読んで視覚確認
3. 問題があれば修正して 2 へ戻る
4. 問題なければ完了とする

Docker 内のファイルが変わった場合（JSON 再生成など）は `docker compose restart web` してから確認する。

#### 6. 完了報告前のチェックリスト（Definition of Done）

ユーザーに「完了しました」と報告する前に、変更内容に応じて以下を必ず確認する。

| 変更レイヤー | 必須確認項目 |
|---|---|
| domain / application | `npx vitest run <test-path>` が緑 + `npx tsc --noEmit` がエラーなし |
| infrastructure | 既存テストが緑 + `npx tsc --noEmit` がエラーなし |
| presentation（UI） | スクリーンショット視覚確認（前述「#### 5. UI 変更時の視覚確認」） + `npx tsc --noEmit` がエラーなし |
| ドキュメントのみ | 対象実装との乖離が無いこと |

**全変更共通：**

- ドキュメント（`docs/10_contexts/<ctx>/`）と実装が整合していること
- 変更範囲に無関係な変更が混入していないこと
- 影響を受ける可能性のある他テストも実行して緑であること（疑わしいときは `npx vitest run` 全体実行）

### Agent への委譲（TDD）

domain / application 層の変更時、Red フェーズと Green フェーズはそれぞれ別の Agent ツール呼び出しで行う。

**subagent_type：** `general-purpose`（書き込み可能。`Explore` / `Plan` は読み取り専用なので不可）

#### フロー

1. **Red Agent 起動**：テストファイルのみを書かせる。Agent 内で `npx vitest run <test-path>` を実行し、失敗出力を返すよう指示する。
2. **Claude が再検証**：Agent 完了後、Claude が `npx vitest run <test-path>` を直接実行して失敗を再確認し、失敗出力をユーザーに提示する。
3. **ユーザー承認後、Red をコミット**。
4. **Green Agent 起動**：実装ファイルのみを書かせる。テストファイルには触れない指示を明示する。Agent 内で `npx vitest run <test-path>` を実行し、緑になったことを返すよう指示する。
5. **Claude が再検証**：`npx vitest run <test-path>` と `npx tsc --noEmit` を実行し、緑と型チェック通過をユーザーに提示する。
6. **ユーザー承認後、Green をコミット**。

#### Agent 呼び出しテンプレート

**Red Agent（テスト記述）**

```
# Task
<1〜2 行で何のテストを書くか>

## 対象
- Bounded Context: <ctx>
- Layer: domain / application
- 対象テストファイル: app/tests/contexts/<ctx>/...

## 参照ドキュメント
- /Users/<user>/.../docs/10_contexts/<ctx>/domain/model.md
- /Users/<user>/.../docs/10_contexts/<ctx>/application/use-cases.md
- /Users/<user>/.../CLAUDE.md（コーディング行動ガイドライン）

## 制約
- 実装ファイルには触れない。テストのみ書く
- 既存のテストヘルパー（tests/_shared/）があれば再利用する

## 完了条件
- テストファイルが書かれている
- `npx vitest run <test-path>` を実行し、失敗していることを確認
- 失敗出力を返す
```

**Green Agent（実装）**

```
# Task
<1〜2 行で何を実装するか>

## 対象
- Bounded Context: <ctx>
- Layer: domain / application
- 対象実装ファイル: app/src/contexts/<ctx>/...
- 対応するテスト: app/tests/contexts/<ctx>/...

## 参照ドキュメント
- /Users/<user>/.../docs/10_contexts/<ctx>/domain/model.md
- /Users/<user>/.../docs/10_contexts/<ctx>/application/use-cases.md
- /Users/<user>/.../CLAUDE.md（コーディング行動ガイドライン）

## 制約
- テストファイルには触れない
- テストを通すための最小限の実装にとどめる

## 完了条件
- `npx vitest run <test-path>` が緑
- `npx tsc --noEmit` がエラーなし
```

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
