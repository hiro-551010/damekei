# Bard（バード）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Cosmic Binding） | magic。Meraki 値をそのまま使用 |
| W（Caretaker's Shrine） | ダメージなし（回復シュライン設置）。preMitigation = 0 で問題なし |
| E（Magical Journey） | ダメージなし（通路生成・移動）。preMitigation = 0 で問題なし |
| R（Tempered Fate） | ダメージなし（石化）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Traveler's Call / Meep） | Meep の追加魔法ダメージはチャイム収集数（スタック）に応じて変化するため単一値で表現できない。計算機では対応しない |
