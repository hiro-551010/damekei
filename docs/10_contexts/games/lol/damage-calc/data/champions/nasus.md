# Nasus（ナサス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Siphoning Strike） | physical。Meraki が基礎ダメージ値（スタックなし）を返す |
| W（Wither） | ダメージなし（スロー）。preMitigation = 0 で問題なし |
| E（Spirit Fire） | magic。Meraki 値をそのまま使用 |
| R（Fury of the Sands） | magic。Meraki が R 発動時の AoE ダメージ値を返す |

## 既知の制限

| 項目 | 内容 |
|---|---|
| Q スタックボーナス | Q はキルするたびに基礎ダメージが +3 ずつ永続増加する（無制限）。スタック数依存のため計算機では基礎値のみ表示される |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Soul Eater） | ライフスティール。ダメージ出力に影響なし |
