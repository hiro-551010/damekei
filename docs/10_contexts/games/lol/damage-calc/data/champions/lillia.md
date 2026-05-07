# Lillia（リリア）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Blooming Blows） | magic。Meraki 値をそのまま使用 |
| W（Watch Out! Eep!） | magic。Meraki 値をそのまま使用 |
| E（Swirlseed） | magic。Meraki 値をそのまま使用 |
| R（Lilting Lullaby） | ダメージなし（スリープ）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Dream-Laden Bough） | スキルヒット後の AA に追加 magic DoT。条件付き発動のため計算機では対応しない |
