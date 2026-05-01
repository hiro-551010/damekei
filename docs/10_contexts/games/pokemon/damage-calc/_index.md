# games/pokemon/damage-calc コンテキスト

ポケモンチャンピオンズにおけるダメージ計算を担う Bounded Context。
攻撃側・防御側のパラメータとわざを受け取り、ダメージレンジを返す。

Phase 1 はクライアント完結（DB・内部 API なし）。

> **移行メモ**：旧 `contexts/damage-calc/` → `contexts/games/pokemon/damage-calc/` に移動予定。
> コード移行時にこのファイルの場所が正本となる。

---

## ドキュメント一覧

| ファイル | 内容 |
|---|---|
| [context.md](./context.md) | 責務・境界・依存関係 |
| [domain/model.md](./domain/model.md) | 集約・Entity・ValueObject の定義 |
| [domain/rules.md](./domain/rules.md) | 不変条件・バリデーションルール |
| [application/use-cases.md](./application/use-cases.md) | ユースケース一覧・入出力 |
| [data/schema.md](./data/schema.md) | 静的 JSON スキーマ（PokeAPI から生成） |

---

## フェーズ対応

| Phase | 機能 | 状態 |
|---|---|---|
| 1 | ダメージ計算（クライアント完結） | 完了 |
| 2 | `builds` コンテキストとの連携（構築シェア） | 完了 |
| 3 | phantom-pokemon の投入 | 未着手 |
