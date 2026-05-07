# Nilah（ニラー）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Formless Blade） | physical。Meraki 値をそのまま使用 |
| W（Jubilant Veil） | ダメージなし（魔法シールド・回避）。preMitigation = 0 で問題なし |
| E（Slipstream） | physical。Meraki 値をそのまま使用 |
| R（Apotheosis） | physical。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Joy Unending） | スキル使用後の強化 AA や味方とのラストヒット共有。条件付き発動のため計算機では対応しない |
