# Master Yi（マスター・イー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Alpha Strike） | physical。Meraki が1ストライクあたりのダメージ値を返す |
| W（Meditate） | ダメージなし（自己回復・ダメージ軽減）。preMitigation = 0 で問題なし |
| E（Wuju Style） | true。次の AA に付与する真ダメージ値を Meraki が返す |
| R（Highlander） | ダメージなし（AS・移動速度増加）。preMitigation = 0 で問題なし |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q は最大4ターゲットを4回攻撃する。Meraki が1ヒットあたりか合計（4ヒット分）かを確認すること |
| E ダメージ値 | E はアクティブ中のすべての AA に真ダメージを追加する。Meraki が1ヒットあたりの値を返しているかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Double Strike） | 4 回 AA ごとに 2 発の AA（50% 追加ダメージ付き）。条件付き周期発動のため計算機では対応しない |
