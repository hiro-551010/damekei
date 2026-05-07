# Milio（ミリオ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Ultra Mega Fire Kick） | magic。Meraki 値をそのまま使用 |
| W（Cozy Campfire） | ダメージなし（回復ゾーン）。preMitigation = 0 で問題なし |
| E（Warm Hugs） | ダメージなし（シールド付与）。preMitigation = 0 で問題なし |
| R（Breath of Life） | ダメージなし（クレンズ・回復）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Fired Up!） | Milio のバフを受けた味方の次の AA に追加魔法ダメージ。味方起点の効果のため計算機では対応しない |
