# ワークフロー

**原則：ドキュメントは正本（Source of Truth）。実装はドキュメントに従う。**
ドキュメントが更新されていない変更は、実装前であっても受け入れない。

ブランチ命名・コミット規約・マージ方法の詳細は `docs/00_governance/git-rules.md` を参照すること。

作業種別によってブランチ運用と Docs ゲートの要否が異なる。

---

## 5.1 機能開発 / バグ修正

| 項目 | 内容 |
|---|---|
| ブランチ | `feature/<ctx>/<slug>` / `fix/<ctx>/<slug>` |
| Docs ゲート | 必須 |
| マージ先 | `develop`（Squash merge） |

1. `develop` からブランチを作成する。
2. 対象 bounded-context とレイヤーを特定する。
3. 該当ドキュメントを作成・更新し、コミットする（実装より先に行う）。
4. **Docs ゲート**：ドキュメントが揃っていることを以下のチェックリストで確認し、ユーザーに提示してレビューを求める。
   - domain 変更 → `docs/10_contexts/<ctx>/domain/model.md` `docs/10_contexts/<ctx>/domain/rules.md` が更新済みか
   - ユースケース追加・変更 → `docs/10_contexts/<ctx>/application/use-cases.md` が更新済みか
   - API 変更 → `docs/10_contexts/<ctx>/interfaces/api.md` および `docs/10_contexts/<ctx>/interfaces/openapi.yaml` が更新済みか（API を持つプロジェクトの場合）
   - DB 変更 → `docs/10_contexts/<ctx>/data/schema.md` が更新済みか
   - **ユーザーの指示に「確認不要」「確認をスキップ」等が明記されている場合は、このレビュー待ちをスキップして実装に進んでよい。**
5. ユーザーの承認後、`docs/00_governance/test-policy.md` の TDD サイクルに従って実装する。
6. infrastructure 層のテストが存在する場合、テストが緑であることを確認する。
7. PR を作成し、docs と code が一致していることを確認する。
8. PR を `develop` にマージ（Squash merge）後、ブランチを削除する。

---

## 5.2 コンテキストドキュメントのみの変更

コードを伴わない `docs/10_contexts/<ctx>/` 配下のドキュメント追加・修正。設計の明文化・誤記修正・仕様の事前整理など。

| 項目 | 内容 |
|---|---|
| ブランチ | `docs/<ctx>/<slug>` |
| Docs ゲート | 不要（ドキュメント自体が目的） |
| マージ先 | `develop`（Squash merge） |

1. `develop` からブランチを作成する。
2. `docs/10_contexts/<ctx>/` 配下のドキュメントを追加・修正する。
3. `docs/30_frontend/<ctx>/` の変更もこのブランチに含めてよい。
4. PR を作成し `develop` にマージする。

**注意：** コードの変更を含めない。実装を伴う場合は 5.1（feature / fix）で行う。

---

## 5.3 ガバナンス変更 / 横断 ADR

`docs/00_governance/`・`CLAUDE.md` の変更、および横断的な意思決定記録（`docs/20_decisions/`）の追加。プロジェクト全体に影響するため、事前に `notes/discussion/` で合意を取ってから実施する。

| 項目 | 内容 |
|---|---|
| ブランチ | `docs/governance/<slug>` |
| Docs ゲート | 不要（ドキュメント自体が目的） |
| マージ先 | `develop`（Squash merge） |

1. `notes/discussion/` で変更内容を議論・合意する。
2. `develop` からブランチを作成する。
3. `docs/00_governance/`・`CLAUDE.md`・`docs/20_decisions/` のいずれかを追加・更新する。
4. コードへの影響がある場合は **別途 `feature/` または `chore/` ブランチ**で対応する（このブランチにコードを含めない）。
5. PR を作成し `develop` にマージする。

**ADR を作成すべきケース：**

- breaking change（セクション7）
- `shared_kernel/` への例外的な追加（`docs/00_governance/shared-kernel-rules.md` 参照）
- 複数の Bounded Context に影響する設計判断
- 技術選定の変更（フレームワーク・DB 等の入れ替え）

ctx 固有の ADR（`docs/10_contexts/<ctx>/adr/`）は 5.2 で対応する。

---

## 5.4 リファクタリング

振る舞いを変えないコード改善。メソッド抽出・命名変更・構造整理など。

| 項目 | 内容 |
|---|---|
| ブランチ | `refactor/<ctx>/<slug>` |
| Docs ゲート | 不要（振る舞いを変えないため） |
| マージ先 | `develop`（Squash merge） |

1. `develop` からブランチを作成する。
2. 既存テストがすべて緑であることを確認する（リファクタ前の基準）。
3. リファクタを実施する。
4. 既存テストがすべて緑のままであることを確認する。
5. PR を作成し `develop` にマージする。

**注意：** 振る舞いの変更を含む場合は 5.1（feature / fix）で行う。テストの追加・修正のみの場合もこのブランチで可。

---

## 5.5 環境・ツール変更

パッケージ追加・Docker 設定・CI 設定・Linter/フォーマッター設定変更など。

| 項目 | 内容 |
|---|---|
| ブランチ | `chore/<slug>` |
| Docs ゲート | 不要（`docs/01_project/` の更新は必要に応じて行う） |
| マージ先 | `develop`（Squash merge） |

1. `develop` からブランチを作成する。
2. 変更を実施する。
3. 影響があれば `docs/01_project/` 内の該当ファイルを更新する。
4. PR を作成し `develop` にマージする。

---

## 5.6 初期環境構築（例外）

プロジェクト開始時の一回限りの環境構築は `develop` に直接コミットしてよい。

---

## 5.7 リリース

`develop` → `main` へ PR を作成し Squash merge する。

main / develop に未実装の仕様のみを反映してはならない。

---

## 5.8 feature ブランチ作業中のガバナンス変更割り込み

`feature/` ブランチで実装中に `docs/00_governance/` または `CLAUDE.md` の変更が必要になった場合。

**このルールは優先度が高い。feature ブランチにガバナンス変更を混入させてはならない。**

| 項目 | 内容 |
|---|---|
| トリガー | feature ブランチ作業中に governance 変更の必要性に気づいた時 |
| 対応 | feature ブランチの作業を中断し、以下の手順に従う |

1. feature ブランチの作業を WIP コミットで一時退避する（割り込み時の例外として WIP コミットを許可する。squash merge で消えるため）。
2. `develop` から `docs/governance/<slug>` ブランチを作成する。
3. `docs/00_governance/` または `CLAUDE.md` を更新する。
4. PR を作成し `develop` にマージする。
5. feature ブランチに戻り、`develop` を pull（または rebase）する。
6. 中断していた実装を再開する。

**判断基準：以下のいずれかに該当する場合に割り込みを発動する。**

- `docs/00_governance/` 配下のファイルを新規作成・変更する必要がある
- `CLAUDE.md` を変更する必要がある

**`docs/01_project/` の変更が必要になった場合は `chore/` ブランチで対応する（governance 割り込みは不要）。**

**割り込み不要なケース（feature ブランチ内で完結してよい）：**

- `docs/10_contexts/<ctx>/` 配下の変更（Docs ゲートの対象）
- `docs/30_frontend/<ctx>/` 配下の変更（該当 feature の設計仕様）
