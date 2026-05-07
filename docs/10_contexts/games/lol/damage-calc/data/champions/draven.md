# Draven（ドレイブン）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Spinning Axe） | physical。次の AA を強化する追加ダメージ。Meraki がランク別の追加ダメージ値を返す |
| W（Blood Rush） | ダメージなし（AS・移動速度増加）。preMitigation = 0 で問題なし |
| E（Stand Aside） | physical。Meraki 値をそのまま使用 |
| R（Whirling Death） | physical。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（League of Draven） | スタック蓄積によるゴールドボーナス。ダメージ出力に影響なし |
