# Qiyana（キヤナ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Edge of Ixtal） | physical。Meraki が基礎ダメージ値を返す |
| W（Terrashape） | ダメージなし（エレメント取得）。preMitigation = 0 で問題なし |
| E（Audacity） | physical。Meraki 値をそのまま使用 |
| R（Supreme Display of Talent） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| Q ダメージ値 | Q はエレメント（川・草・岩）によって追加効果が異なる。Meraki がエレメントあり・なしどちらの値を返すかを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Royal Privilege） | 同じ敵への初回ヒットに追加 physical ダメージ。条件付き発動のため計算機では対応しない |
