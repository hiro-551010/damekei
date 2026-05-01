# `<ctx>` コンテキスト

## ディレクトリ構成

```
docs/10_contexts/<ctx>/
├── _index.md
├── context.md
├── domain/
│   ├── model.md
│   ├── rules.md
│   └── events.md        # ドメインイベントがある場合
├── application/
│   └── use-cases.md
├── interfaces/
│   ├── api.md
│   └── openapi.yaml    # API を持つプロジェクトの場合
├── data/
│   └── schema.md
└── adr/                 # ctx 固有の意思決定記録
```

---

## 各ファイルの記述ガイド

### _index.md
- このコンテキストの一言説明
- 配下ドキュメントへのリンク一覧

### context.md
- 責務（何をするコンテキストか）
- 境界（何をしないか）
- 他コンテキストとの依存関係

### domain/model.md
- Aggregate・Entity・ValueObject の定義
- フィールド・型・制約
- ステータス遷移図（必要な場合）

### domain/rules.md
- 不変条件・バリデーションルール
- ビジネスルール（「〜してはならない」「〜でなければならない」）

### domain/events.md
- ドメインイベントの一覧と発火条件

### application/use-cases.md
- コマンド・クエリの一覧
- 各ユースケースの入力・出力・DTO定義

### interfaces/api.md
- エンドポイント一覧と設計意図（人間向け）
- リクエスト・レスポンス例
- エラーレスポンス
- ビジネス上の制約やユースケースのフロー

### interfaces/openapi.yaml（API を持つプロジェクトの場合）
- 機械可読な API 定義（OpenAPI 3.x）
- api.md と補完関係：api.md が「なぜ・何のために」、openapi.yaml が「正確な入出力仕様」を担う

### data/schema.md
- DB テーブル定義
- マイグレーション方針（Expand/Contract）
