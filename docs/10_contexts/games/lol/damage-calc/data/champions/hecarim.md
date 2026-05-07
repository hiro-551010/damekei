# Hecarim（ヘカリム）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Rampage） | physical。Meraki 値をそのまま使用 |
| W（Spirit of Dread） | magic。ダメージを吸収して周囲に魔法ダメージ。Meraki 値をそのまま使用 |
| E（Devastating Charge） | physical。ボーナス移動速度に応じてダメージが増加する強化 AA。Meraki が基礎値を返す |
| R（Onslaught of Shadows） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| E ダメージ値 | E は突進中の移動速度ボーナスに比例してダメージが増加する。Meraki が最大加速時か基礎値のみかを確認すること |

## 既知の制限

| 項目 | 内容 |
|---|---|
| Passive（Warpath）ボーナス AD | ボーナス移動速度の一定割合が AD に変換されるが、移動速度はアイテム・スキルで大きく変動するため標準ステータスには含まれない。AA・E のダメージは Warpath によるボーナス AD を反映しない |
