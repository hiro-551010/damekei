# ディレクトリ構造（汎用）

プロジェクト固有の具体的なディレクトリツリーは `docs/01_project/directory-structure.md` を参照すること。

---

## ドキュメント構造

```
docs/
├── 00_governance/     # 汎用ガバナンス原則（技術スタック非依存）
├── 01_project/        # プロジェクト固有設定（技術スタック・ディレクトリ構造等）
├── 10_contexts/       # Bounded Context 単位の設計（コードと 1:1 対応）
│   └── <ctx>/
│       ├── _index.md          # 入口（必須）
│       ├── context.md         # 境界 / 責務 / 依存
│       ├── domain/
│       │   ├── model.md       # 集約 / Entity / VO
│       │   ├── rules.md       # 不変条件 / バリデーション
│       │   └── events.md      # ドメインイベント（必要なら）
│       ├── application/
│       │   └── use-cases.md   # コマンド / クエリ / 入出力
│       ├── interfaces/
│       │   ├── api.md         # API 契約（人間向け設計ドキュメント）
│       │   └── openapi.yaml   # API 定義（機械可読、API を持つ場合）
│       ├── data/
│       │   └── schema.md      # DB スキーマ / 移行方針
│       └── adr/               # ctx 固有 ADR
├── 20_decisions/      # 全体 ADR（横断意思決定）
└── 30_frontend/       # フロントエンド設計（Web アプリがある場合）
    └── <ctx>/
        └── _index.md  # ページ・コンポーネント設計
```

---

## コード構造（DDD レイヤー）

各 Bounded Context は以下の 4 層で実装する。

```
<ctx>/
├── domain/          # ドメイン層（外部ライブラリ依存禁止）
├── application/     # アプリケーション層（domain のみ依存可）
├── infrastructure/  # インフラ層（domain の Repository IF を実装）
└── presentation/    # プレゼンテーション層（application を呼び出す）
```

---

## Shared Kernel

複数の Bounded Context から参照される薄い共通基盤。ドメイン知識を含めない。
（詳細は `docs/00_governance/shared-kernel-rules.md` を参照）

```
shared_kernel/
├── types/
├── errors/
├── ids/
├── datetime/
└── utils/
```

---

## テスト構造

```
tests/
├── _shared/           # テスト専用共通ユーティリティ（shared_kernel とは別）
│   ├── builders/
│   ├── fixtures/
│   ├── fakes/
│   ├── matchers/
│   └── testkit/
└── <ctx>/
    ├── unit/
    │   ├── domain/
    │   └── application/
    ├── integration/
    │   ├── persistence/
    │   ├── migrations/
    │   └── external/
    └── contract/
        └── http/
```

---

## notes/ 構造（Obsidian）

```
notes/
├── til/             # 実装中の気づき・TIL
├── investigation/   # バグ調査・技術調査ログ
├── discussion/      # ADR 化前の議論
└── meetings/        # ミーティングノート
```
