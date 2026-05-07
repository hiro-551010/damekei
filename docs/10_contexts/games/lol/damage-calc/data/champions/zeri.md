# Zeri（ゼリ）champion-passives.json

## champion-passives.json エントリ

なし

## 各スキルの扱い

| スロット | スキル名 | ダメージタイプ | 備考 |
|---|---|---|---|
| Q | Burst Fire | physical | AAに代わるQ連射 |
| W | Ultrashock Laser | magic | 貫通レーザー |
| E | Spark Surge | physical | チェーン壁越え |
| R | Lightning Crash | physical | 嵐発動 |

## 要確認

- Q（Burst Fire）: ZeriのAAはQ扱いで、通常AAとQ連射が同一スキルのため、Merakiのデータ構造が特殊な可能性
- E（Spark Surge）: ダメージなしの場合にphysicalが割り当てられているか確認

## 既知の制限

- Q がAAと同一扱いのため、通常AA計算とスキルQ計算の境界が不明確
