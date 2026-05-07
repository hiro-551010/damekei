# Cassiopeia（カシオペア）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Noxious Blast） | magic。Meraki 値をそのまま使用 |
| W（Miasma） | magic。着地時のダメージを Meraki が返す |
| E（Twin Fang） | magic。毒状態への追加ダメージを含まない基礎値を Meraki が返す |
| R（Petrifying Gaze） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Serpentine Grace） | ブーツ装備不可・ゲイン補正のみ。ダメージ出力に直接影響なし |
| E 毒状態ボーナスダメージ | 基礎 E ダメージとは独立した追加魔法ダメージ（20〜80 + 0.1AP）のため固定倍率で表現できない。計算機では基礎値のみ表示 |
