# damage-calc コンテキスト定義

## 責務

- 攻撃側・防御側のポケモンパラメータとわざを受け取り、ダメージレンジを計算して返す
- ポケモンチャンピオンズに登場する 311 種のポケモンデータ（種族値・タイプ・わざ・特性・もちもの）を提供する
- ダメージ計算ロジックは `@smogon/calc` に委譲する（infrastructure 層でラップ）

## 境界（このコンテキストがやらないこと）

- パーティ構成の保存・シェア（→ `team-builds` コンテキスト）
- 架空ポケモンの定義・生成（→ `phantom-pokemon` コンテキスト）
- ユーザー認証・アカウント管理
- ポケモンの種族値以外のゲームデータ（育成方法・出現場所等）

## 他コンテキストとの依存関係

Phase 1 では他コンテキストとの連携なし。

```
damage-calc
  └── shared_kernel（types / errors / ids）
```

Phase 2 以降:

```
team-builds ──依存→ damage-calc（計算ロジックを利用）
phantom-pokemon ──依存→ damage-calc（架空ポケモンを計算に投入）
```

依存は一方向。`damage-calc` は他コンテキストを知らない。

## 技術的な境界

- 計算ロジックは `@smogon/calc` に委譲し、domain 層から直接触らない
- `@smogon/calc` の型・定数は infrastructure 層でラップして domain 層に漏らさない
- PokeAPI のレスポンス形式は infrastructure 層で変換し、domain モデルとして扱う
- Phase 1 は内部 API なし。presentation 層から application 層のユースケースを直接呼ぶ
