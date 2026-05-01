# テストポリシー

## 目的

- domainの不変条件を固定する
- ユースケースの振る舞いを保証する
- API / DB / 外部I/F の契約を壊さない
- バグ修正時に再発を防止する
- mainを常に安全な状態に保つ

---

## テストディレクトリ構成

```txt
tests/
  _shared/           # テスト専用共通（shared_kernelとは別）
    builders/
    fixtures/
    fakes/
    matchers/
    testkit/

  <ctx>/
    unit/
      domain/
      application/
    integration/
      persistence/
      migrations/
      external/
    contract/
      http/
```

E2E テストの配置場所・ツールはプロジェクト固有。詳細は `docs/01_project/e2e-policy.md` を参照。

- `tests/_shared` はテスト専用共通。`shared_kernel/` とは別。
- unit は domain と application を分離。
- integration は DB / Repo / migration を担保。
- contract は API 入出力の固定。
- e2e はフロントエンド側で管理し、クリティカルパスのみ。

---

## テスト階層

### Unit（最優先）
対象：domain層中心
目的：不変条件・境界値・異常系の固定
禁止：DB/HTTP/外部SDKの直接使用

### Integration
対象：Repository実装 / DB / migrations
DBは実物を使用する。
外部APIは原則モック。

### Contract
対象：HTTPリクエスト/レスポンス / status / validation
API変更時は必須。

### E2E
対象：クリティカルパスのみ
本数は最小限。

---

## 変更種別と必須テスト

- domain変更 → unit必須（対象ctx）
- application変更 → unit必須
- infrastructure/DB変更 → integration必須
- API変更 → contract必須
- バグ修正 → 再現テスト必須（再現テストを先に書いて Red を確認してから修正する）
- リファクタ → 既存テスト緑が前提

---

## テストを書くタイミング

**原則：ドキュメント更新 → テスト（Red）→ 実装（Green）→ Refactor の順序を守る。**
例外は infrastructure 層のみ（後述）。

### domain / application / contract（TDD 必須）

domain・application 層の unit テスト、および API 変更時の contract テストは TDD で行う。
contract テストは Docs ゲートで `openapi.yaml` が更新済みのため、実装前に書ける。

Red → Green → Refactor の順序を守る：

1. **Red**：実装より先にテストを書き、失敗することを確認する
   - 失敗を確認することで「テストが仕様を検証している」ことを証明する（実装後に書くとバグ込みの実装に合わせたテストが書けてしまうため）
   - テストコード・失敗出力をユーザーに提示し、承認を得てからテストをコミットする
   - **テスト記述中に仕様の曖昧さ・誤りを発見した場合は実装に進まず、先にドキュメントを更新してから再度 Red から始める**
2. **Green**：テストが通る最小限の実装をする
   - テストコミット後、実装完了まで **テストファイルに触れてはならない**
   - `git diff` でテストファイルに変更がないこと・実装コード・テスト成功出力をユーザーに提示し、承認を得てから実装をコミットする
3. **Refactor**：テストが緑のまま実装コード・テストコードを整理する
   - テストコードの整理（リネーム・ヘルパー抽出等）もこのフェーズで行う
   - テストコードを変更した場合はユーザーに提示し、承認を得る

### infrastructure 層（例外：実装後でよい）

- DB・外部 API・Repository 実装は環境依存が強いため、実装後にテストを書く
- PR マージ前にテストが緑であること

---

## CIゲート

### 毎PR
- lint / format
- unit（全体）
- integration（変更ctx）
- contract（API変更時）

### 任意（nightly）
- 全integration
- 全e2e

CIが緑でないPRはマージ禁止。
