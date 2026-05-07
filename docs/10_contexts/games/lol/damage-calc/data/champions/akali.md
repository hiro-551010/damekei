# Akali（アカリ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Five Point Strike） | magic。Meraki 値をそのまま使用 |
| W（Twilight Shroud） | ダメージなし。Meraki の damageType は "physical" だが値がすべて空のため preMitigation = 0 になり問題なし |
| E（Shuriken Flip） | magic。Meraki が flip + dash 合計値を返している可能性があるが許容 |
| R（Perfect Execution） | magic。R1 + R2 の合計を Meraki が返している可能性があるが許容 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Assassin's Mark） | アビリティ使用後にリングを越えた次の AA に魔法ダメージ追加。ring 形成・通過という条件付き発動のため計算機では対応しない |
