# Ezreal（エズリアル）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Mystic Shot） | physical。Meraki 値をそのまま使用 |
| W（Essence Flux） | magic。Meraki 値をそのまま使用 |
| E（Arcane Shift） | magic。ダッシュ先でのダメージを Meraki が返す |
| R（Trueshot Barrage） | magic。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Rising Spell Force） | スキルヒットで AS スタックを獲得。ダメージ出力に影響なし |
| Q のオンヒット適用 | Q はオンヒット効果を適用するスキルだが、計算機はスキルへのオンヒット連動を未対応のためアイテムオンヒットと Q の相互作用は表示されない |
