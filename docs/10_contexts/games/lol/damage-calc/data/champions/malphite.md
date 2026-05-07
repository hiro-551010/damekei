# Malphite（マルファイト）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Seismic Shard） | magic。Meraki 値をそのまま使用 |
| W（Thunderclap） | physical + magic。Meraki が強化 AA の物理ダメージ値を返す |
| E（Ground Slam） | magic。Meraki 値をそのまま使用 |
| R（Unstoppable Force） | magic。Meraki 値をそのまま使用 |

## 要確認

| 項目 | 懸念点 |
|---|---|
| W ダメージ値 | W はアクティブで次の AA を強化（物理）し、さらに周囲に AoE magic ダメージを与える複合スキル。Meraki が物理部分のみ、magic 部分のみ、または合算かを確認すること |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Granite Shield） | HP の一定割合をシールドとして回復。ダメージ出力に影響なし |
