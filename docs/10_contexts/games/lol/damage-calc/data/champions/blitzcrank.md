# Blitzcrank（ブリッツクランク）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Rocket Grab） | magic。Meraki 値をそのまま使用 |
| W（Overdrive） | ダメージなし（AS・移動速度増加）。preMitigation = 0 で問題なし |
| E（Power Fist） | physical。tAD スケーリングで次の AA を 2 倍強化。Meraki 値をそのまま使用 |
| R（Static Field） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Mana Barrier） | マナ残量に基づくシールド。ダメージ出力に影響なし |
