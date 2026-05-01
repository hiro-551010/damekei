# Shared Kernel ルール

## 原則

- `shared_kernel/` は **"薄い基盤" のみ**（具体的な配置場所は `docs/01_project/directory-structure.md` を参照）
- Bounded Context のビジネスルールを入れない
- `shared_kernel` から `modules/<ctx>` への依存は禁止（片方向を守る）

---

## 許可リスト（入れて良いもの）

- **types/**：汎用型（例：Result, Option 等）
- **errors/**：共通のエラー基盤（ErrorBase, ErrorCode型, trace_id 等）
- **ids/**：汎用ID（ULID/UUIDラッパ、ID生成）
- **datetime/**：日時ユーティリティ（UTC統一、期間計算の"汎用"）
- **utils/**：副作用のない薄い汎用（文字列整形等）

※ "audio専用日付計算" のようなドメイン知識は **各ctxのdomainへ**。

---

## 禁止リスト（入れてはいけないもの）

- Entity / ValueObject / Aggregate（ドメインモデル）
- UseCase（commands/queries/handlers）
- Repository（IF含む。IFは各ctxのdomainに置く）
- 外部I/Fアダプタ（HTTP/DB/SDK）
- あるctxの用語を含む型（例：AudioId を shared_kernel に置くのは原則禁止）
  - 例外：明確に複数ctxの共有概念として合意し、ADRに記録した場合のみ

---

## 例外運用（ADR必須）

次のいずれかを shared_kernel に入れたい場合、必ず ADR を作成する：

- "複数ctxで共有する" ドメイン概念の導入
- 共通化により ctx の独立性が下がる可能性がある変更
