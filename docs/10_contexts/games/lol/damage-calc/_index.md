# games/lol/damage-calc コンテキスト

League of Legends におけるダメージ計算を担う Bounded Context。
攻撃側チャンピオン・レベル・ビルド・スキルと、防御側チャンピオン・レベル・ビルドを受け取り、
物理・魔法・真のダメージ値を返す。

Phase 1 はクライアント完結（DB・内部 API なし）。

---

## ドキュメント一覧

| ファイル | 内容 |
|---|---|
| [context.md](./context.md) | 責務・境界・依存関係 |
| [domain/model.md](./domain/model.md) | 集約・Entity・ValueObject の定義 |
| [domain/rules.md](./domain/rules.md) | 不変条件・バリデーションルール |
| [application/use-cases.md](./application/use-cases.md) | ユースケース一覧・入出力 |
| [data/schema.md](./data/schema.md) | 静的 JSON スキーマ（Meraki Analytics から生成） |

---

## フェーズ対応

| Phase | 機能 | 状態 |
|---|---|---|
| 1 | ダメージ計算（クライアント完結） | 未着手 |
| 2 | `builds` コンテキストとの連携（構築シェア） | 未着手 |
