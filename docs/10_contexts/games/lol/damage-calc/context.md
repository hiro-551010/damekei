# damage-calc コンテキスト定義（LoL）

## 責務

- 攻撃側・防御側のチャンピオンパラメータとスキルを受け取り、最終ダメージを計算して返す
- League of Legends に登場する全チャンピオンのデータ（基礎ステータス・成長値・スキル係数）を提供する
- アイテムのステータス（AD・AP・Lethality・貫通率等）を提供する
- ダメージ計算ロジックは LoL Wiki の計算式に基づき domain 層で自前実装する（`@smogon/calc` 相当のライブラリが存在しないため）
- データソースは Meraki Analytics（`cdn.merakianalytics.com`）を使用する

## 境界（このコンテキストがやらないこと）

- 構築の保存・シェア（→ `builds` コンテキスト）
- ユーザー認証・アカウント管理
- チャンピオン固有のパッシブアビリティによるダメージ修正（初期スコープ外。`domain/rules.md` 参照）
- オンヒット効果の計算（初期スコープ外）
- ルーンによるステータス修正（初期スコープ外）
- ゲームクライアントのリアルタイムデータ取得

## 他コンテキストとの依存関係

Phase 1 では他コンテキストとの連携なし。

```
lol/damage-calc
  └── shared_kernel（types / errors / ids）
```

Phase 2 以降:

```
builds ──依存→ lol/damage-calc（構築データの保存に gameId: "lol" を使用）
```

依存は一方向。`lol/damage-calc` は他コンテキストを知らない。

## 技術的な境界

- Meraki Analytics のレスポンス形式は infrastructure 層で変換し、domain モデルとして扱う
- ダメージ計算式（貫通適用順序・乗数計算等）は domain 層の `DamageCalculator` に実装する
- Phase 1 は内部 API なし。presentation 層から application 層のユースケースを直接呼ぶ
