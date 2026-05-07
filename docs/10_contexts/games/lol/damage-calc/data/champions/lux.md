# Lux（ラックス）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Light Binding） | magic。Meraki 値をそのまま使用 |
| W（Prismatic Barrier） | ダメージなし（シールド）。preMitigation = 0 で問題なし |
| E（Lucent Singularity） | magic。Meraki 値をそのまま使用 |
| R（Final Spark） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Illumination） | スキルヒット後の次の AA または R でマークを爆発させて追加 magic ダメージ。条件付き発動のため計算機では対応しない |
