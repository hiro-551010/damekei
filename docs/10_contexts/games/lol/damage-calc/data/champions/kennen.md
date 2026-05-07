# Kennen（ケネン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Thundering Shuriken） | magic。Meraki 値をそのまま使用 |
| W（Electrical Surge） | magic。W アクティブ（マーク爆発）のダメージ値を Meraki が返す |
| E（Lightning Rush） | magic。突入・離脱時のダメージを Meraki が返す |
| R（Slicing Maelstrom） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Mark of the Storm） | 3 マーク蓄積でスタン付与。追加ダメージなし |
| W パッシブ（5 回目 AA 魔法ダメージ） | AA 5 回ごとに追加 magic ダメージ + マーク付与。条件付き周期発動のため計算機では対応しない |
