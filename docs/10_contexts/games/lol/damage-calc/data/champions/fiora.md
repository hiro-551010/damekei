# Fiora（フィオラ）champion-passives.json

## champion-passives.json エントリ

なし（Meraki データをそのまま使用）。

## 各スキルの扱い

| スキル | 扱い |
|---|---|
| Q（Lunge） | physical。Meraki 値をそのまま使用 |
| W（Riposte） | physical。成功・不成功にかかわらず基礎ダメージを Meraki が返す |
| E（Bladework） | physical。2 回目の AA での追加ダメージ値を Meraki が返す |
| R（Grand Challenge） | physical。Meraki 値をそのまま使用 |

## 対象外

| 項目 | 理由 |
|---|---|
| Passive（Duelist's Dance）バイタルダメージ | バイタルヒット時の magic ダメージは対象の最大 HP 割合ベース。HP% スケーリングをスキルモデルで表現できないため対応しない |
| R バイタル真ダメージ | Grand Challenge 発動中のバイタルは最大 HP% の真ダメージ。同様に HP% スケーリングのため対応しない |
| W パリィ成功ボーナス | パリィ成功時の追加ダメージ・スタンは条件付きのため計算機では対応しない |
