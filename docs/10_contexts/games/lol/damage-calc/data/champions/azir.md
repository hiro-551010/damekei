# Azir（アジール）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Conquering Sands） | magic。砂兵が突進してヒットするダメージを Meraki が返す |
| W（Arise!） | ダメージなし（砂兵召喚）。preMitigation = 0 で問題なし |
| E（Shifting Sands） | magic。Meraki 値をそのまま使用 |
| R（Emperor's Divide） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| 砂兵 AA（soldier AA） | 砂兵が行う magic AA は tAD スケーリングだが通常 AA とは別枠。本計算機では通常の物理 AA を表示するにとどめる |
| Passive（Shurima's Legacy） | 砂兵の永続召喚権限を付与するのみ。ダメージなし |
