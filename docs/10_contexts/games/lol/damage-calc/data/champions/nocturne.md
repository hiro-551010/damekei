# Nocturne（ノクターン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Duskbringer） | physical。Meraki 値をそのまま使用 |
| W（Shroud of Darkness） | ダメージなし（スペルシールド）。preMitigation = 0 で問題なし |
| E（Unspeakable Horror） | magic。Meraki 値をそのまま使用 |
| R（Paranoia） | ダメージなし（全体暗闇 + ダッシュ）。preMitigation = 0 で問題なし |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Umbra Blades） | 10 秒ごとに次の AA が AoE physical ダメージ。条件付き周期発動のため計算機では対応しない |
| Q トレイル中ボーナス AD | Q の残像上にいる間のボーナス AD は滞在条件依存のため計算機では対応しない |
